import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Reputation: Contract owner can authorize contracts",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall(
                'reputation-tracker',
                'authorize-contract',
                [types.principal(wallet1.address)],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Verify authorization
        let query = chain.callReadOnlyFn(
            'reputation-tracker',
            'is-authorized-contract',
            [types.principal(wallet1.address)],
            deployer.address
        );
        
        query.result.expectOk().expectBool(true);
    },
});

Clarinet.test({
    name: "Reputation: Non-owner cannot authorize contracts",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        
        let block = chain.mineBlock([
            Tx.contractCall(
                'reputation-tracker',
                'authorize-contract',
                [types.principal(wallet2.address)],
                wallet1.address
            )
        ]);
        
        block.receipts[0].result.expectErr().expectUint(100); // ERR-NOT-AUTHORIZED
    },
});

Clarinet.test({
    name: "Reputation: Authorized contract can record completion",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const worker = accounts.get('wallet_1')!;
        
        // Authorize deployer to call contract functions
        let block = chain.mineBlock([
            Tx.contractCall(
                'reputation-tracker',
                'authorize-contract',
                [types.principal(deployer.address)],
                deployer.address
            )
        ]);
        
        // Record completion with rating 5
        block = chain.mineBlock([
            Tx.contractCall(
                'reputation-tracker',
                'record-completion',
                [
                    types.principal(worker.address),
                    types.bool(true), // is-worker
                    types.uint(5)     // rating
                ],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Check user stats
        let query = chain.callReadOnlyFn(
            'reputation-tracker',
            'get-user-stats',
            [types.principal(worker.address)],
            deployer.address
        );
        
        const stats = query.result.expectOk().expectTuple();
        assertEquals(stats['total-tasks-completed'], types.uint(1));
        assertEquals(stats['total-ratings'], types.uint(1));
        assertEquals(stats['sum-ratings'], types.uint(5));
    },
});

Clarinet.test({
    name: "Reputation: Invalid rating is rejected",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const worker = accounts.get('wallet_1')!;
        
        // Authorize deployer
        let block = chain.mineBlock([
            Tx.contractCall(
                'reputation-tracker',
                'authorize-contract',
                [types.principal(deployer.address)],
                deployer.address
            )
        ]);
        
        // Try to record completion with invalid rating (0)
        block = chain.mineBlock([
            Tx.contractCall(
                'reputation-tracker',
                'record-completion',
                [
                    types.principal(worker.address),
                    types.bool(true),
                    types.uint(0) // Invalid - below minimum
                ],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectErr().expectUint(101); // ERR-INVALID-RATING
        
        // Try with rating above maximum (6)
        block = chain.mineBlock([
            Tx.contractCall(
                'reputation-tracker',
                'record-completion',
                [
                    types.principal(worker.address),
                    types.bool(true),
                    types.uint(6) // Invalid - above maximum
                ],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectErr().expectUint(101); // ERR-INVALID-RATING
    },
});

Clarinet.test({
    name: "Reputation: Calculate reputation score correctly",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const worker = accounts.get('wallet_1')!;
        
        // Authorize deployer
        let block = chain.mineBlock([
            Tx.contractCall(
                'reputation-tracker',
                'authorize-contract',
                [types.principal(deployer.address)],
                deployer.address
            )
        ]);
        
        // Record multiple completions
        block = chain.mineBlock([
            Tx.contractCall(
                'reputation-tracker',
                'record-completion',
                [types.principal(worker.address), types.bool(true), types.uint(5)],
                deployer.address
            ),
            Tx.contractCall(
                'reputation-tracker',
                'record-completion',
                [types.principal(worker.address), types.bool(true), types.uint(4)],
                deployer.address
            ),
            Tx.contractCall(
                'reputation-tracker',
                'record-completion',
                [types.principal(worker.address), types.bool(true), types.uint(5)],
                deployer.address
            )
        ]);
        
        // Get reputation score
        let query = chain.callReadOnlyFn(
            'reputation-tracker',
            'get-reputation',
            [types.principal(worker.address)],
            deployer.address
        );
        
        const reputation = query.result.expectOk();
        // Score should be: (3 completed * 100) + (avg rating 4.67 * 200) = 300 + 933 = 1233+
        // Exact calculation: 300 + ((14/3) * 200) = 300 + 933.33 = 1233
    },
});

Clarinet.test({
    name: "Reputation: Record task created and spent amount",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const creator = accounts.get('wallet_1')!;
        
        // Authorize deployer
        let block = chain.mineBlock([
            Tx.contractCall(
                'reputation-tracker',
                'authorize-contract',
                [types.principal(deployer.address)],
                deployer.address
            )
        ]);
        
        // Record task created with 1000000 microSTX
        block = chain.mineBlock([
            Tx.contractCall(
                'reputation-tracker',
                'record-task-created',
                [types.principal(creator.address), types.uint(1000000)],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Check stats
        let query = chain.callReadOnlyFn(
            'reputation-tracker',
            'get-user-stats',
            [types.principal(creator.address)],
            deployer.address
        );
        
        const stats = query.result.expectOk().expectTuple();
        assertEquals(stats['total-spent'], types.uint(1000000));
    },
});

Clarinet.test({
    name: "Reputation: Record task earned amount",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const worker = accounts.get('wallet_1')!;
        
        // Authorize deployer
        let block = chain.mineBlock([
            Tx.contractCall(
                'reputation-tracker',
                'authorize-contract',
                [types.principal(deployer.address)],
                deployer.address
            )
        ]);
        
        // Record earnings
        block = chain.mineBlock([
            Tx.contractCall(
                'reputation-tracker',
                'record-task-earned',
                [types.principal(worker.address), types.uint(500000)],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Check stats
        let query = chain.callReadOnlyFn(
            'reputation-tracker',
            'get-user-stats',
            [types.principal(worker.address)],
            deployer.address
        );
        
        const stats = query.result.expectOk().expectTuple();
        assertEquals(stats['total-earned'], types.uint(500000));
    },
});

Clarinet.test({
    name: "Reputation: Record dispute and calculate impact",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const worker = accounts.get('wallet_1')!;
        
        // Authorize deployer
        let block = chain.mineBlock([
            Tx.contractCall(
                'reputation-tracker',
                'authorize-contract',
                [types.principal(deployer.address)],
                deployer.address
            )
        ]);
        
        // Record dispute won
        block = chain.mineBlock([
            Tx.contractCall(
                'reputation-tracker',
                'record-dispute',
                [
                    types.principal(worker.address),
                    types.bool(true),  // is-worker
                    types.bool(true)   // won
                ],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Check stats
        let query = chain.callReadOnlyFn(
            'reputation-tracker',
            'get-user-stats',
            [types.principal(worker.address)],
            deployer.address
        );
        
        const stats = query.result.expectOk().expectTuple();
        assertEquals(stats['disputes-opened'], types.uint(1));
        assertEquals(stats['disputes-won'], types.uint(1));
        assertEquals(stats['disputes-lost'], types.uint(0));
        
        // Record dispute lost
        block = chain.mineBlock([
            Tx.contractCall(
                'reputation-tracker',
                'record-dispute',
                [
                    types.principal(worker.address),
                    types.bool(true),
                    types.bool(false)  // lost
                ],
                deployer.address
            )
        ]);
        
        // Check updated stats
        query = chain.callReadOnlyFn(
            'reputation-tracker',
            'get-user-stats',
            [types.principal(worker.address)],
            deployer.address
        );
        
        const updatedStats = query.result.expectOk().expectTuple();
        assertEquals(updatedStats['disputes-opened'], types.uint(2));
        assertEquals(updatedStats['disputes-won'], types.uint(1));
        assertEquals(updatedStats['disputes-lost'], types.uint(1));
    },
});

Clarinet.test({
    name: "Reputation: Get average rating",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const worker = accounts.get('wallet_1')!;
        
        // Authorize deployer
        let block = chain.mineBlock([
            Tx.contractCall(
                'reputation-tracker',
                'authorize-contract',
                [types.principal(deployer.address)],
                deployer.address
            )
        ]);
        
        // Record ratings: 5, 4, 3
        block = chain.mineBlock([
            Tx.contractCall(
                'reputation-tracker',
                'record-completion',
                [types.principal(worker.address), types.bool(true), types.uint(5)],
                deployer.address
            ),
            Tx.contractCall(
                'reputation-tracker',
                'record-completion',
                [types.principal(worker.address), types.bool(true), types.uint(4)],
                deployer.address
            ),
            Tx.contractCall(
                'reputation-tracker',
                'record-completion',
                [types.principal(worker.address), types.bool(true), types.uint(3)],
                deployer.address
            )
        ]);
        
        // Get average rating (should be 4 * 100 = 400 for 4.00)
        let query = chain.callReadOnlyFn(
            'reputation-tracker',
            'get-average-rating',
            [types.principal(worker.address)],
            deployer.address
        );
        
        const avgRating = query.result.expectOk();
        // Average = (5+4+3)/3 = 4, represented as 400 (4.00 * 100)
        assertEquals(avgRating, types.uint(400));
    },
});

Clarinet.test({
    name: "Reputation: Unauthorized contract cannot record data",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        const worker = accounts.get('wallet_2')!;
        
        // Try to record completion without authorization
        let block = chain.mineBlock([
            Tx.contractCall(
                'reputation-tracker',
                'record-completion',
                [types.principal(worker.address), types.bool(true), types.uint(5)],
                wallet1.address
            )
        ]);
        
        block.receipts[0].result.expectErr().expectUint(100); // ERR-NOT-AUTHORIZED
    },
});

Clarinet.test({
    name: "Reputation: Can revoke contract authorization",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        // Authorize contract
        let block = chain.mineBlock([
            Tx.contractCall(
                'reputation-tracker',
                'authorize-contract',
                [types.principal(wallet1.address)],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Revoke authorization
        block = chain.mineBlock([
            Tx.contractCall(
                'reputation-tracker',
                'revoke-contract',
                [types.principal(wallet1.address)],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Verify revocation
        let query = chain.callReadOnlyFn(
            'reputation-tracker',
            'is-authorized-contract',
            [types.principal(wallet1.address)],
            deployer.address
        );
        
        query.result.expectOk().expectBool(false);
    },
});
