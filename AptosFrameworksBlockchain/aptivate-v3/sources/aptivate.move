// In sources/aptivate.move
module aptivate_admin::aptivate {

    // --- Imports ---
    use std::signer;
    use std::string::{String};
    use std::vector;
    use aptos_framework::table::{Self, Table};
    use aptos_framework::event;
    use aptos_framework::timestamp;

    // --- Constants ---
    const INITIAL_XP_REWARD: u64 = 100;
    const VERIFIER_XP_REWARD: u64 = 25;

    // --- Error Codes ---
    const E_NOT_ADMIN: u64 = 1;
    const E_PROFILE_ALREADY_EXISTS: u64 = 2;
    const E_PROFILE_NOT_FOUND: u64 = 3;
    const E_HUB_NOT_PUBLISHED: u64 = 4;
    const E_PROJECT_NOT_FOUND: u64 = 5;
    const E_NOT_A_VERIFIER: u64 = 6;
    const E_ALREADY_VERIFIED: u64 = 7;

        const VERIFICATION_THRESHOLD: u64 = 3; // New: Number of approvals needed

    // --- Data Structures ---
    struct ProjectStatus has store, drop, copy {
        is_pending: bool,
        is_approved: bool,
        is_rejected: bool,
    }

    struct Project has store, key, drop {
        id: u64,
        owner: address,
        code_hash: vector<u8>,
        metadata_url: String,
        status: ProjectStatus,
        upvotes: u64,
        submission_timestamp: u64,
        approvals: u64,             // New: To count approvals
        verified_by: vector<address>,
    }

    struct UserProfile has key {
        xp: u64,
        is_verifier: bool,
    }

    struct AptivateHub has key {
        projects: Table<u64, Project>,
        next_project_id: u64,
    }
    
    // --- Events ---
    #[event] // FIX: Added #[event] attribute
    struct ProjectSubmitted has drop, store { submitter: address, project_id: u64 }

    #[event] // FIX: Added #[event] attribute
    struct ProjectVerified has drop, store { verifier: address, project_id: u64, approved: bool }

    // --- Module Initializer ---
    // FIX: Changed from 'public fun' to just 'fun' to make it private
    fun init_module(sender: &signer) {
        assert!(signer::address_of(sender) == @aptivate_admin, E_NOT_ADMIN);
        move_to(sender, AptivateHub {
            projects: table::new(),
            next_project_id: 0,
        });
    }

    // --- User Functions ---
    public entry fun register_user(sender: &signer) {
        let sender_addr = signer::address_of(sender);
        assert!(!exists<UserProfile>(sender_addr), E_PROFILE_ALREADY_EXISTS);
        move_to(sender, UserProfile {
            xp: 0,
            is_verifier: false,
        });
    }

   public entry fun submit_project(sender: &signer, code_hash: vector<u8>, metadata_url: String) acquires AptivateHub {
        let sender_addr = signer::address_of(sender);
        assert!(exists<UserProfile>(sender_addr), E_PROFILE_NOT_FOUND);
        let hub = borrow_global_mut<AptivateHub>(@aptivate_admin);
        let project_id = hub.next_project_id;

        let new_project = Project {
            id: project_id,
            owner: sender_addr,
            code_hash,
            metadata_url,
            status: ProjectStatus { is_pending: true, is_approved: false, is_rejected: false },
            upvotes: 0,
            submission_timestamp: timestamp::now_seconds(),
            approvals: 0,
            verified_by: vector::empty(), // MINOR IMPROVEMENT: Using vector::empty() is cleaner
        };

        table::add(&mut hub.projects, project_id, new_project);
        hub.next_project_id = project_id + 1;
        event::emit(ProjectSubmitted { submitter: sender_addr, project_id });
    }

    public entry fun verify_project(verifier: &signer, project_id: u64, approved: bool) acquires AptivateHub, UserProfile {
        let verifier_addr = signer::address_of(verifier);
        assert!(exists<UserProfile>(verifier_addr), E_PROFILE_NOT_FOUND);
        let verifier_profile = borrow_global<UserProfile>(verifier_addr);
        assert!(verifier_profile.is_verifier, E_NOT_A_VERIFIER);

        let hub = borrow_global_mut<AptivateHub>(@aptivate_admin);
        assert!(table::contains(&hub.projects, project_id), E_PROJECT_NOT_FOUND);
        let project = table::borrow_mut(&mut hub.projects, project_id);
        
        assert!(project.status.is_pending, E_ALREADY_VERIFIED);

        // ✅ CRITICAL FIX: Add this line to prevent a verifier from approving the same project twice.
        assert!(!vector::contains(&project.verified_by, &verifier_addr), E_ALREADY_VERIFIED);

        if (approved) {
            vector::push_back(&mut project.verified_by, verifier_addr);
            project.approvals = project.approvals + 1;

            if (project.approvals >= VERIFICATION_THRESHOLD) {
                project.status = ProjectStatus { is_pending: false, is_approved: true, is_rejected: false };
                
                let developer_profile = borrow_global_mut<UserProfile>(project.owner);
                developer_profile.xp = developer_profile.xp + INITIAL_XP_REWARD;

                let i = 0;
                while (i < vector::length(&project.verified_by)) {
                    let approver_addr = *vector::borrow(&project.verified_by, i);
                    let approver_profile = borrow_global_mut<UserProfile>(approver_addr);
                    approver_profile.xp = approver_profile.xp + VERIFIER_XP_REWARD;
                    i = i + 1;
                };
            };
        } else {
            project.status = ProjectStatus { is_pending: false, is_approved: false, is_rejected: true };
        };

        event::emit(ProjectVerified { verifier: verifier_addr, project_id, approved });
    }
}