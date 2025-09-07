module freelance_admin::freelance {

    // --- Imports ---
    use std::signer;
    use std::string::{String};
    use std::mem;
    // 'use std::vector;' was removed as it's not used in this module.
    use aptos_framework::table::{Self, Table};
    use aptos_framework::aptos_coin::{AptosCoin};
    use aptos_framework::coin;
    use aptos_framework::event;
    use aptos_framework::timestamp;

    // --- Constants ---
    const FREELANCER_XP_REWARD: u64 = 50;

    // --- Error Codes ---
    const E_NOT_ADMIN: u64 = 1;
    const E_PROFILE_ALREADY_EXISTS: u64 = 2;
    const E_PROFILE_NOT_FOUND: u64 = 3;
    const E_PROJECT_NOT_FOUND: u64 = 4;
    const E_INSUFFICIENT_FUNDS: u64 = 5;
    const E_PROJECT_NOT_OPEN: u64 = 6;
    const E_NOT_AUTHORIZED: u64 = 7;
    const E_PROJECT_NOT_COMPLETED: u64 = 8;
    const E_PROJECT_ALREADY_ASSIGNED: u64 = 9;
    const E_DEADLINE_EXCEEDED: u64 = 10;
    const E_DEADLINE_NOT_REACHED: u64 = 11;
    const E_INVALID_CANCELLATION_REQUEST: u64 = 12;
    const E_NO_CANCELLATION_REQUESTED: u64 = 13;

    // --- Data Structures ---
    enum ProjectStatus has store, drop, copy { Open, InProgress, Completed, Paid, Expired, Cancelled }
    struct UserProfile has key { xp: u64, name: String }
    struct Project has store {
        id: u64,
        client: address,
        freelancer: address,
        title: String,
        description: String,
        status: ProjectStatus,
        escrow: coin::Coin<AptosCoin>,
        deadline_timestamp: u64,
        cancellation_requester: address,
    }
    struct FreelanceHub has key { projects: Table<u64, Project>, next_project_id: u64 }

    // --- Events ---
    #[event]
    struct ProjectPosted has drop, store { client: address, project_id: u64, amount: u64 }
    #[event]
    struct PaymentReleased has drop, store { project_id: u64, client: address, freelancer: address, amount: u64 }

    // --- Module Initializer ---
    fun init_module(sender: &signer) {
        assert!(signer::address_of(sender) == @freelance_admin, E_NOT_ADMIN);
        move_to(sender, FreelanceHub { projects: table::new(), next_project_id: 0 });
    }

    // --- User Functions ---
    public entry fun register_user(sender: &signer, name: String) {
        let sender_addr = signer::address_of(sender);
        assert!(!exists<UserProfile>(sender_addr), E_PROFILE_ALREADY_EXISTS);
        move_to(sender, UserProfile { xp: 0, name });
    }

    public entry fun post_project( client: &signer, title: String, description: String, amount: u64, deadline_timestamp: u64 ) acquires FreelanceHub {
        let client_addr = signer::address_of(client);
        assert!(exists<UserProfile>(client_addr), E_PROFILE_NOT_FOUND);
        assert!(coin::balance<AptosCoin>(client_addr) >= amount, E_INSUFFICIENT_FUNDS);
        assert!(deadline_timestamp > timestamp::now_seconds(), E_DEADLINE_EXCEEDED);
        let hub = borrow_global_mut<FreelanceHub>(@freelance_admin);
        let project_id = hub.next_project_id;
        let new_project = Project {
            id: project_id, client: client_addr, freelancer: @0x0, title, description,
            status: ProjectStatus::Open, escrow: coin::withdraw<AptosCoin>(client, amount),
            deadline_timestamp, cancellation_requester: @0x0,
        };
        table::add(&mut hub.projects, project_id, new_project);
        hub.next_project_id = project_id + 1;
        event::emit(ProjectPosted { client: client_addr, project_id, amount });
    }

    public entry fun accept_project(freelancer: &signer, project_id: u64) acquires FreelanceHub {
        let freelancer_addr = signer::address_of(freelancer);
        assert!(exists<UserProfile>(freelancer_addr), E_PROFILE_NOT_FOUND);
        let hub = borrow_global_mut<FreelanceHub>(@freelance_admin);
        let project = table::borrow_mut(&mut hub.projects, project_id);
        assert!(project.status == ProjectStatus::Open, E_PROJECT_NOT_OPEN);
        assert!(project.freelancer == @0x0, E_PROJECT_ALREADY_ASSIGNED);
        project.freelancer = freelancer_addr;
        project.status = ProjectStatus::InProgress;
    }

    public entry fun submit_work(freelancer: &signer, project_id: u64) acquires FreelanceHub {
        let freelancer_addr = signer::address_of(freelancer);
        let hub = borrow_global_mut<FreelanceHub>(@freelance_admin);
        let project = table::borrow_mut(&mut hub.projects, project_id);
        assert!(freelancer_addr == project.freelancer, E_NOT_AUTHORIZED);
        assert!(timestamp::now_seconds() <= project.deadline_timestamp, E_DEADLINE_EXCEEDED);
        project.status = ProjectStatus::Completed;
    }

    public entry fun release_payment(client: &signer, project_id: u64) acquires FreelanceHub, UserProfile {
        let client_addr = signer::address_of(client);
        let hub = borrow_global_mut<FreelanceHub>(@freelance_admin);
        let project = table::borrow_mut(&mut hub.projects, project_id);

        assert!(client_addr == project.client, E_NOT_AUTHORIZED);
        assert!(project.status == ProjectStatus::Completed, E_PROJECT_NOT_COMPLETED);

        let amount = coin::value(&project.escrow);
        
        // ✅ FIX: Use the correct, public function 'coin::extract_all' to move the funds.
        let funds_to_move = coin::extract_all(&mut project.escrow);
        coin::deposit(project.freelancer, funds_to_move);

        let freelancer_profile = borrow_global_mut<UserProfile>(project.freelancer);
        freelancer_profile.xp = freelancer_profile.xp + FREELANCER_XP_REWARD;

        project.status = ProjectStatus::Paid;
        event::emit(PaymentReleased { project_id, client: client_addr, freelancer: project.freelancer, amount });
    }

    public entry fun reclaim_escrow(client: &signer, project_id: u64) acquires FreelanceHub {
        let client_addr = signer::address_of(client);
        let hub = borrow_global_mut<FreelanceHub>(@freelance_admin);
        let project = table::borrow_mut(&mut hub.projects, project_id);

        assert!(client_addr == project.client, E_NOT_AUTHORIZED);
        assert!(project.status == ProjectStatus::InProgress, E_PROJECT_NOT_OPEN);
        assert!(timestamp::now_seconds() > project.deadline_timestamp, E_DEADLINE_NOT_REACHED);

        // ✅ FIX: Use 'coin::extract_all' here as well.
        let funds_to_move = coin::extract_all(&mut project.escrow);
        coin::deposit(client_addr, funds_to_move);
        
        project.status = ProjectStatus::Expired;
    }

    public entry fun cancel_unassigned_project(client: &signer, project_id: u64) acquires FreelanceHub {
        let client_addr = signer::address_of(client);
        let hub = borrow_global_mut<FreelanceHub>(@freelance_admin);
        let project = table::borrow_mut(&mut hub.projects, project_id);

        assert!(client_addr == project.client, E_NOT_AUTHORIZED);
        assert!(project.status == ProjectStatus::Open, E_PROJECT_NOT_OPEN);

        // ✅ FIX: Use 'coin::extract_all' here as well.
        let funds_to_move = coin::extract_all(&mut project.escrow);
        coin::deposit(client_addr, funds_to_move);
        
        project.status = ProjectStatus::Cancelled;
    }

    public entry fun approve_mutual_cancellation(sender: &signer, project_id: u64) acquires FreelanceHub {
        let sender_addr = signer::address_of(sender);
        let hub = borrow_global_mut<FreelanceHub>(@freelance_admin);
        let project = table::borrow_mut(&mut hub.projects, project_id);

        let requester = project.cancellation_requester;
        assert!(requester != @0x0, E_NO_CANCELLATION_REQUESTED);
        assert!(requester != sender_addr, E_INVALID_CANCELLATION_REQUEST);
        assert!(sender_addr == project.client || sender_addr == project.freelancer, E_NOT_AUTHORIZED);

        // ✅ FIX: Use 'coin::extract_all' here as well.
        let funds_to_move = coin::extract_all(&mut project.escrow);
        coin::deposit(project.client, funds_to_move);

        project.status = ProjectStatus::Cancelled;
    }

    // public entry fun approve_mutual_cancellation(sender: &signer, project_id: u64) acquires FreelanceHub {
    //     let sender_addr = signer::address_of(sender);
    //     let hub = borrow_global_mut<FreelanceHub>(@freelance_admin);
    //     let project = table::borrow_mut(&mut hub.projects, project_id);
    //     let requester = project.cancellation_requester;
    //     assert!(requester != @0x0, E_NO_CANCELLATION_REQUESTED);
    //     assert!(requester != sender_addr, E_INVALID_CANCELLATION_REQUEST);
    //     assert!(sender_addr == project.client || sender_addr == project.freelancer, E_NOT_AUTHORIZED);
    //     let funds_to_move = coin::zero<AptosCoin>();
    //     mem::swap(&mut funds_to_move, &mut project.escrow);
    //     coin::deposit(project.client, funds_to_move);
    //     project.status = ProjectStatus::Cancelled;
    // }
    // DUPLICATED FUNCTION REMOVED

    // --- View Functions ---
    #[view]
    public fun get_project(project_id: u64): (address, address, String, String, ProjectStatus, u64, u64) acquires FreelanceHub {
        let hub = borrow_global<FreelanceHub>(@freelance_admin);
        assert!(table::contains(&hub.projects, project_id), E_PROJECT_NOT_FOUND);
        let project = table::borrow(&hub.projects, project_id);
        (
            project.client,
            project.freelancer,
            project.title,
            project.description,
            project.status,
            coin::value(&project.escrow),
            project.deadline_timestamp,
        )
    }

    #[view]
    public fun get_user_profile(user_addr: address): (u64, String) acquires UserProfile {
        assert!(exists<UserProfile>(user_addr), E_PROFILE_NOT_FOUND);
        let profile = borrow_global<UserProfile>(user_addr);
        (profile.xp, profile.name)
    }
}