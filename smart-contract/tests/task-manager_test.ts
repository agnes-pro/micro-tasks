import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "TaskManager: Can set escrow and reputation contracts",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const escrowAddress = `${deployer.address}.task-escrow`;
        const reputationAddress = `${deployer.address}.reputation-tracker`;
        
        let block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'set-escrow-contract',
                [types.principal(escrowAddress)],
                deployer.address
            ),
            Tx.contractCall(
                'task-manager',
                'set-reputation-contract',
                [types.principal(reputationAddress)],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        block.receipts[1].result.expectOk().expectBool(true);
    },
});

Clarinet.test({
    name: "TaskManager: Can create task with valid inputs",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const creator = accounts.get('wallet_1')!;
        const escrowAddress = `${deployer.address}.task-escrow`;
        const reputationAddress = `${deployer.address}.reputation-tracker`;
        
        // Set up contracts
        let block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'set-escrow-contract',
                [types.principal(escrowAddress)],
                deployer.address
            ),
            Tx.contractCall(
                'task-manager',
                'set-reputation-contract',
                [types.principal(reputationAddress)],
                deployer.address
            ),
            Tx.contractCall(
                'task-escrow',
                'authorize-contract',
                [types.principal(`${deployer.address}.task-manager`)],
                deployer.address
            ),
            Tx.contractCall(
                'reputation-tracker',
                'authorize-contract',
                [types.principal(`${deployer.address}.task-manager`)],
                deployer.address
            )
        ]);
        
        // Create task
        const deadline = chain.blockHeight + 100;
        block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'create-task',
                [
                    types.ascii("Test Task"),
                    types.utf8("This is a test task description"),
                    types.ascii("Data Labeling"),
                    types.uint(1000000), // 1 STX
                    types.uint(deadline)
                ],
                creator.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectUint(1); // First task ID should be 1
        
        // Verify task was created
        let query = chain.callReadOnlyFn(
            'task-manager',
            'get-task',
            [types.uint(1)],
            deployer.address
        );
        
        const task = query.result.expectOk().expectSome().expectTuple();
        assertEquals(task['creator'], types.principal(creator.address));
        assertEquals(task['title'], types.ascii("Test Task"));
        assertEquals(task['reward'], types.uint(1000000));
        assertEquals(task['status'], types.uint(0)); // STATUS-OPEN
    },
});

Clarinet.test({
    name: "TaskManager: Reject task with empty title",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const creator = accounts.get('wallet_1')!;
        const escrowAddress = `${deployer.address}.task-escrow`;
        
        let block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'set-escrow-contract',
                [types.principal(escrowAddress)],
                deployer.address
            )
        ]);
        
        const deadline = chain.blockHeight + 100;
        block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'create-task',
                [
                    types.ascii(""), // Empty title
                    types.utf8("Description"),
                    types.ascii("Category"),
                    types.uint(1000000),
                    types.uint(deadline)
                ],
                creator.address
            )
        ]);
        
        block.receipts[0].result.expectErr().expectUint(306); // ERR-INVALID-TITLE
    },
});

Clarinet.test({
    name: "TaskManager: Reject task with past deadline",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const creator = accounts.get('wallet_1')!;
        const escrowAddress = `${deployer.address}.task-escrow`;
        
        let block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'set-escrow-contract',
                [types.principal(escrowAddress)],
                deployer.address
            )
        ]);
        
        const deadline = chain.blockHeight - 1; // Past deadline
        block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'create-task',
                [
                    types.ascii("Test Task"),
                    types.utf8("Description"),
                    types.ascii("Category"),
                    types.uint(1000000),
                    types.uint(deadline)
                ],
                creator.address
            )
        ]);
        
        block.receipts[0].result.expectErr().expectUint(305); // ERR-DEADLINE-PASSED
    },
});

Clarinet.test({
    name: "TaskManager: Can assign task to worker",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const creator = accounts.get('wallet_1')!;
        const worker = accounts.get('wallet_2')!;
        const escrowAddress = `${deployer.address}.task-escrow`;
        
        // Setup
        let block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'set-escrow-contract',
                [types.principal(escrowAddress)],
                deployer.address
            ),
            Tx.contractCall(
                'task-escrow',
                'authorize-contract',
                [types.principal(`${deployer.address}.task-manager`)],
                deployer.address
            )
        ]);
        
        // Create task
        const deadline = chain.blockHeight + 100;
        block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'create-task',
                [
                    types.ascii("Test Task"),
                    types.utf8("Description"),
                    types.ascii("Category"),
                    types.uint(1000000),
                    types.uint(deadline)
                ],
                creator.address
            )
        ]);
        
        const taskId = block.receipts[0].result.expectOk();
        
        // Assign task
        block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'assign-task',
                [taskId, types.principal(worker.address)],
                creator.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Verify assignment
        let query = chain.callReadOnlyFn(
            'task-manager',
            'get-task',
            [taskId],
            deployer.address
        );
        
        const task = query.result.expectOk().expectSome().expectTuple();
        assertEquals(task['worker'], types.some(types.principal(worker.address)));
        assertEquals(task['status'], types.uint(1)); // STATUS-ASSIGNED
    },
});

Clarinet.test({
    name: "TaskManager: Only creator can assign task",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const creator = accounts.get('wallet_1')!;
        const worker = accounts.get('wallet_2')!;
        const unauthorized = accounts.get('wallet_3')!;
        const escrowAddress = `${deployer.address}.task-escrow`;
        
        let block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'set-escrow-contract',
                [types.principal(escrowAddress)],
                deployer.address
            ),
            Tx.contractCall(
                'task-escrow',
                'authorize-contract',
                [types.principal(`${deployer.address}.task-manager`)],
                deployer.address
            )
        ]);
        
        const deadline = chain.blockHeight + 100;
        block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'create-task',
                [
                    types.ascii("Test Task"),
                    types.utf8("Description"),
                    types.ascii("Category"),
                    types.uint(1000000),
                    types.uint(deadline)
                ],
                creator.address
            )
        ]);
        
        const taskId = block.receipts[0].result.expectOk();
        
        // Try to assign as non-creator
        block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'assign-task',
                [taskId, types.principal(worker.address)],
                unauthorized.address
            )
        ]);
        
        block.receipts[0].result.expectErr().expectUint(300); // ERR-NOT-AUTHORIZED
    },
});

Clarinet.test({
    name: "TaskManager: Worker can submit work",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const creator = accounts.get('wallet_1')!;
        const worker = accounts.get('wallet_2')!;
        const escrowAddress = `${deployer.address}.task-escrow`;
        
        // Setup
        let block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'set-escrow-contract',
                [types.principal(escrowAddress)],
                deployer.address
            ),
            Tx.contractCall(
                'task-escrow',
                'authorize-contract',
                [types.principal(`${deployer.address}.task-manager`)],
                deployer.address
            )
        ]);
        
        // Create and assign task
        const deadline = chain.blockHeight + 100;
        block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'create-task',
                [
                    types.ascii("Test Task"),
                    types.utf8("Description"),
                    types.ascii("Category"),
                    types.uint(1000000),
                    types.uint(deadline)
                ],
                creator.address
            )
        ]);
        
        const taskId = block.receipts[0].result.expectOk();
        
        block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'assign-task',
                [taskId, types.principal(worker.address)],
                creator.address
            )
        ]);
        
        // Submit work
        block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'submit-work',
                [
                    taskId,
                    types.utf8("https://example.com/submission"),
                    types.utf8("Work completed successfully")
                ],
                worker.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Verify submission
        let query = chain.callReadOnlyFn(
            'task-manager',
            'get-task',
            [taskId],
            deployer.address
        );
        
        const task = query.result.expectOk().expectSome().expectTuple();
        assertEquals(task['status'], types.uint(2)); // STATUS-SUBMITTED
        assertEquals(task['submission-url'], types.some(types.utf8("https://example.com/submission")));
    },
});

Clarinet.test({
    name: "TaskManager: Only assigned worker can submit",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const creator = accounts.get('wallet_1')!;
        const worker = accounts.get('wallet_2')!;
        const unauthorized = accounts.get('wallet_3')!;
        const escrowAddress = `${deployer.address}.task-escrow`;
        
        let block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'set-escrow-contract',
                [types.principal(escrowAddress)],
                deployer.address
            ),
            Tx.contractCall(
                'task-escrow',
                'authorize-contract',
                [types.principal(`${deployer.address}.task-manager`)],
                deployer.address
            )
        ]);
        
        const deadline = chain.blockHeight + 100;
        block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'create-task',
                [
                    types.ascii("Test Task"),
                    types.utf8("Description"),
                    types.ascii("Category"),
                    types.uint(1000000),
                    types.uint(deadline)
                ],
                creator.address
            )
        ]);
        
        const taskId = block.receipts[0].result.expectOk();
        
        block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'assign-task',
                [taskId, types.principal(worker.address)],
                creator.address
            )
        ]);
        
        // Try to submit as unauthorized user
        block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'submit-work',
                [
                    taskId,
                    types.utf8("https://example.com/submission"),
                    types.utf8("Work completed")
                ],
                unauthorized.address
            )
        ]);
        
        block.receipts[0].result.expectErr().expectUint(300); // ERR-NOT-AUTHORIZED
    },
});

Clarinet.test({
    name: "TaskManager: Creator can approve task",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const creator = accounts.get('wallet_1')!;
        const worker = accounts.get('wallet_2')!;
        const escrowAddress = `${deployer.address}.task-escrow`;
        const reputationAddress = `${deployer.address}.reputation-tracker`;
        
        // Setup
        let block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'set-escrow-contract',
                [types.principal(escrowAddress)],
                deployer.address
            ),
            Tx.contractCall(
                'task-manager',
                'set-reputation-contract',
                [types.principal(reputationAddress)],
                deployer.address
            ),
            Tx.contractCall(
                'task-escrow',
                'authorize-contract',
                [types.principal(`${deployer.address}.task-manager`)],
                deployer.address
            ),
            Tx.contractCall(
                'reputation-tracker',
                'authorize-contract',
                [types.principal(`${deployer.address}.task-manager`)],
                deployer.address
            )
        ]);
        
        // Create, assign, and submit task
        const deadline = chain.blockHeight + 100;
        block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'create-task',
                [
                    types.ascii("Test Task"),
                    types.utf8("Description"),
                    types.ascii("Category"),
                    types.uint(1000000),
                    types.uint(deadline)
                ],
                creator.address
            )
        ]);
        
        const taskId = block.receipts[0].result.expectOk();
        
        block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'assign-task',
                [taskId, types.principal(worker.address)],
                creator.address
            ),
            Tx.contractCall(
                'task-manager',
                'submit-work',
                [
                    taskId,
                    types.utf8("https://example.com/submission"),
                    types.utf8("Work done")
                ],
                worker.address
            )
        ]);
        
        // Approve task
        block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'approve-task',
                [taskId, types.uint(5)], // 5-star rating
                creator.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Verify status
        let query = chain.callReadOnlyFn(
            'task-manager',
            'get-task',
            [taskId],
            deployer.address
        );
        
        const task = query.result.expectOk().expectSome().expectTuple();
        assertEquals(task['status'], types.uint(3)); // STATUS-APPROVED
    },
});

Clarinet.test({
    name: "TaskManager: Creator can reject task",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const creator = accounts.get('wallet_1')!;
        const worker = accounts.get('wallet_2')!;
        const escrowAddress = `${deployer.address}.task-escrow`;
        
        let block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'set-escrow-contract',
                [types.principal(escrowAddress)],
                deployer.address
            ),
            Tx.contractCall(
                'task-escrow',
                'authorize-contract',
                [types.principal(`${deployer.address}.task-manager`)],
                deployer.address
            )
        ]);
        
        const deadline = chain.blockHeight + 100;
        block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'create-task',
                [
                    types.ascii("Test Task"),
                    types.utf8("Description"),
                    types.ascii("Category"),
                    types.uint(1000000),
                    types.uint(deadline)
                ],
                creator.address
            )
        ]);
        
        const taskId = block.receipts[0].result.expectOk();
        
        block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'assign-task',
                [taskId, types.principal(worker.address)],
                creator.address
            ),
            Tx.contractCall(
                'task-manager',
                'submit-work',
                [taskId, types.utf8("https://example.com/submission"), types.utf8("Work done")],
                worker.address
            )
        ]);
        
        // Reject task
        block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'reject-task',
                [taskId, types.utf8("Quality not acceptable")],
                creator.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Verify status
        let query = chain.callReadOnlyFn(
            'task-manager',
            'get-task',
            [taskId],
            deployer.address
        );
        
        const task = query.result.expectOk().expectSome().expectTuple();
        assertEquals(task['status'], types.uint(6)); // STATUS-REJECTED
    },
});

Clarinet.test({
    name: "TaskManager: Can open dispute",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const creator = accounts.get('wallet_1')!;
        const worker = accounts.get('wallet_2')!;
        const escrowAddress = `${deployer.address}.task-escrow`;
        
        let block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'set-escrow-contract',
                [types.principal(escrowAddress)],
                deployer.address
            ),
            Tx.contractCall(
                'task-escrow',
                'authorize-contract',
                [types.principal(`${deployer.address}.task-manager`)],
                deployer.address
            )
        ]);
        
        const deadline = chain.blockHeight + 100;
        block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'create-task',
                [
                    types.ascii("Test Task"),
                    types.utf8("Description"),
                    types.ascii("Category"),
                    types.uint(1000000),
                    types.uint(deadline)
                ],
                creator.address
            )
        ]);
        
        const taskId = block.receipts[0].result.expectOk();
        
        block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'assign-task',
                [taskId, types.principal(worker.address)],
                creator.address
            ),
            Tx.contractCall(
                'task-manager',
                'submit-work',
                [taskId, types.utf8("https://example.com/submission"), types.utf8("Work done")],
                worker.address
            )
        ]);
        
        // Open dispute
        block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'open-dispute',
                [taskId],
                worker.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Verify status
        let query = chain.callReadOnlyFn(
            'task-manager',
            'get-task',
            [taskId],
            deployer.address
        );
        
        const task = query.result.expectOk().expectSome().expectTuple();
        assertEquals(task['status'], types.uint(4)); // STATUS-DISPUTED
    },
});

Clarinet.test({
    name: "TaskManager: Creator can cancel unassigned task",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const creator = accounts.get('wallet_1')!;
        const escrowAddress = `${deployer.address}.task-escrow`;
        
        let block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'set-escrow-contract',
                [types.principal(escrowAddress)],
                deployer.address
            ),
            Tx.contractCall(
                'task-escrow',
                'authorize-contract',
                [types.principal(`${deployer.address}.task-manager`)],
                deployer.address
            )
        ]);
        
        const deadline = chain.blockHeight + 100;
        block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'create-task',
                [
                    types.ascii("Test Task"),
                    types.utf8("Description"),
                    types.ascii("Category"),
                    types.uint(1000000),
                    types.uint(deadline)
                ],
                creator.address
            )
        ]);
        
        const taskId = block.receipts[0].result.expectOk();
        
        // Cancel task
        block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'cancel-task',
                [taskId],
                creator.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Verify status
        let query = chain.callReadOnlyFn(
            'task-manager',
            'get-task',
            [taskId],
            deployer.address
        );
        
        const task = query.result.expectOk().expectSome().expectTuple();
        assertEquals(task['status'], types.uint(5)); // STATUS-CANCELLED
    },
});

Clarinet.test({
    name: "TaskManager: Cannot cancel submitted task",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const creator = accounts.get('wallet_1')!;
        const worker = accounts.get('wallet_2')!;
        const escrowAddress = `${deployer.address}.task-escrow`;
        
        let block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'set-escrow-contract',
                [types.principal(escrowAddress)],
                deployer.address
            ),
            Tx.contractCall(
                'task-escrow',
                'authorize-contract',
                [types.principal(`${deployer.address}.task-manager`)],
                deployer.address
            )
        ]);
        
        const deadline = chain.blockHeight + 100;
        block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'create-task',
                [
                    types.ascii("Test Task"),
                    types.utf8("Description"),
                    types.ascii("Category"),
                    types.uint(1000000),
                    types.uint(deadline)
                ],
                creator.address
            )
        ]);
        
        const taskId = block.receipts[0].result.expectOk();
        
        block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'assign-task',
                [taskId, types.principal(worker.address)],
                creator.address
            ),
            Tx.contractCall(
                'task-manager',
                'submit-work',
                [taskId, types.utf8("https://example.com/submission"), types.utf8("Work done")],
                worker.address
            )
        ]);
        
        // Try to cancel submitted task
        block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'cancel-task',
                [taskId],
                creator.address
            )
        ]);
        
        block.receipts[0].result.expectErr().expectUint(302); // ERR-INVALID-STATUS
    },
});

Clarinet.test({
    name: "TaskManager: Read-only functions work correctly",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const creator = accounts.get('wallet_1')!;
        const worker = accounts.get('wallet_2')!;
        const escrowAddress = `${deployer.address}.task-escrow`;
        
        let block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'set-escrow-contract',
                [types.principal(escrowAddress)],
                deployer.address
            ),
            Tx.contractCall(
                'task-escrow',
                'authorize-contract',
                [types.principal(`${deployer.address}.task-manager`)],
                deployer.address
            )
        ]);
        
        const deadline = chain.blockHeight + 100;
        block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'create-task',
                [
                    types.ascii("Test Task"),
                    types.utf8("Description"),
                    types.ascii("Category"),
                    types.uint(1000000),
                    types.uint(deadline)
                ],
                creator.address
            )
        ]);
        
        const taskId = block.receipts[0].result.expectOk();
        
        block = chain.mineBlock([
            Tx.contractCall(
                'task-manager',
                'assign-task',
                [taskId, types.principal(worker.address)],
                creator.address
            )
        ]);
        
        // Test is-task-creator
        let query = chain.callReadOnlyFn(
            'task-manager',
            'is-task-creator',
            [taskId, types.principal(creator.address)],
            deployer.address
        );
        query.result.expectOk().expectBool(true);
        
        // Test is-task-worker
        query = chain.callReadOnlyFn(
            'task-manager',
            'is-task-worker',
            [taskId, types.principal(worker.address)],
            deployer.address
        );
        query.result.expectOk().expectBool(true);
        
        // Test get-task-count
        query = chain.callReadOnlyFn(
            'task-manager',
            'get-task-count',
            [],
            deployer.address
        );
        query.result.expectOk().expectUint(1);
    },
});
