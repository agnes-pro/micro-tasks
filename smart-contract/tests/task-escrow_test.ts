import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Escrow: Can authorize contracts",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall(
                'task-escrow',
                'authorize-contract',
                [types.principal(wallet1.address)],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
    },
});

Clarinet.test({
    name: "Escrow: Can deposit escrow with valid amount",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const creator = accounts.get('wallet_1')!;
        const taskId = 1;
        const reward = 1000000; // 1 STX in microSTX
        
        // Authorize deployer to call escrow functions
        let block = chain.mineBlock([
            Tx.contractCall(
                'task-escrow',
                'authorize-contract',
                [types.principal(deployer.address)],
                deployer.address
            )
        ]);
        
        // Deposit escrow
        block = chain.mineBlock([
            Tx.contractCall(
                'task-escrow',
                'deposit-escrow',
                [
                    types.uint(taskId),
                    types.uint(reward),
                    types.principal(creator.address)
                ],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Verify escrow exists
        let query = chain.callReadOnlyFn(
            'task-escrow',
            'get-escrow',
            [types.uint(taskId)],
            deployer.address
        );
        
        const escrow = query.result.expectOk().expectSome().expectTuple();
        assertEquals(escrow['amount'], types.uint(reward));
        assertEquals(escrow['creator'], types.principal(creator.address));
        assertEquals(escrow['released'], types.bool(false));
    },
});

Clarinet.test({
    name: "Escrow: Reject deposit below minimum",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const creator = accounts.get('wallet_1')!;
        const taskId = 1;
        const reward = 50000; // Below minimum of 100000
        
        let block = chain.mineBlock([
            Tx.contractCall(
                'task-escrow',
                'authorize-contract',
                [types.principal(deployer.address)],
                deployer.address
            )
        ]);
        
        block = chain.mineBlock([
            Tx.contractCall(
                'task-escrow',
                'deposit-escrow',
                [
                    types.uint(taskId),
                    types.uint(reward),
                    types.principal(creator.address)
                ],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectErr().expectUint(204); // ERR-INVALID-AMOUNT
    },
});

Clarinet.test({
    name: "Escrow: Calculate platform fee correctly",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const reward = 1000000; // 1 STX
        
        // Expected fee: 1000000 * 250 / 10000 = 25000 (0.025 STX)
        let query = chain.callReadOnlyFn(
            'task-escrow',
            'calculate-platform-fee',
            [types.uint(reward)],
            deployer.address
        );
        
        const fee = query.result.expectOk();
        assertEquals(fee, types.uint(25000));
    },
});

Clarinet.test({
    name: "Escrow: Calculate total deposit including fee",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const reward = 1000000; // 1 STX
        
        // Expected total: 1000000 + 25000 = 1025000
        let query = chain.callReadOnlyFn(
            'task-escrow',
            'calculate-total-deposit',
            [types.uint(reward)],
            deployer.address
        );
        
        const total = query.result.expectOk();
        assertEquals(total, types.uint(1025000));
    },
});

Clarinet.test({
    name: "Escrow: Can set worker on escrow",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const creator = accounts.get('wallet_1')!;
        const worker = accounts.get('wallet_2')!;
        const taskId = 1;
        const reward = 1000000;
        
        let block = chain.mineBlock([
            Tx.contractCall(
                'task-escrow',
                'authorize-contract',
                [types.principal(deployer.address)],
                deployer.address
            )
        ]);
        
        // Deposit escrow
        block = chain.mineBlock([
            Tx.contractCall(
                'task-escrow',
                'deposit-escrow',
                [
                    types.uint(taskId),
                    types.uint(reward),
                    types.principal(creator.address)
                ],
                deployer.address
            )
        ]);
        
        // Set worker
        block = chain.mineBlock([
            Tx.contractCall(
                'task-escrow',
                'set-worker',
                [types.uint(taskId), types.principal(worker.address)],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Verify worker is set
        let query = chain.callReadOnlyFn(
            'task-escrow',
            'get-escrow',
            [types.uint(taskId)],
            deployer.address
        );
        
        const escrow = query.result.expectOk().expectSome().expectTuple();
        assertEquals(escrow['worker'], types.some(types.principal(worker.address)));
    },
});

Clarinet.test({
    name: "Escrow: Can release funds to worker",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const creator = accounts.get('wallet_1')!;
        const worker = accounts.get('wallet_2')!;
        const taskId = 1;
        const reward = 1000000;
        
        let block = chain.mineBlock([
            Tx.contractCall(
                'task-escrow',
                'authorize-contract',
                [types.principal(deployer.address)],
                deployer.address
            )
        ]);
        
        // Deposit escrow
        block = chain.mineBlock([
            Tx.contractCall(
                'task-escrow',
                'deposit-escrow',
                [
                    types.uint(taskId),
                    types.uint(reward),
                    types.principal(creator.address)
                ],
                deployer.address
            )
        ]);
        
        // Set worker
        block = chain.mineBlock([
            Tx.contractCall(
                'task-escrow',
                'set-worker',
                [types.uint(taskId), types.principal(worker.address)],
                deployer.address
            )
        ]);
        
        // Get worker balance before
        const workerBalanceBefore = chain.getAssetsMaps().assets['STX'][worker.address];
        
        // Release funds
        block = chain.mineBlock([
            Tx.contractCall(
                'task-escrow',
                'release-funds',
                [types.uint(taskId)],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Verify released status
        let query = chain.callReadOnlyFn(
            'task-escrow',
            'get-escrow',
            [types.uint(taskId)],
            deployer.address
        );
        
        const escrow = query.result.expectOk().expectSome().expectTuple();
        assertEquals(escrow['released'], types.bool(true));
        
        // Verify worker received funds
        const workerBalanceAfter = chain.getAssetsMaps().assets['STX'][worker.address];
        assertEquals(workerBalanceAfter, workerBalanceBefore + reward);
    },
});

Clarinet.test({
    name: "Escrow: Cannot release funds twice",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const creator = accounts.get('wallet_1')!;
        const worker = accounts.get('wallet_2')!;
        const taskId = 1;
        const reward = 1000000;
        
        let block = chain.mineBlock([
            Tx.contractCall(
                'task-escrow',
                'authorize-contract',
                [types.principal(deployer.address)],
                deployer.address
            )
        ]);
        
        block = chain.mineBlock([
            Tx.contractCall(
                'task-escrow',
                'deposit-escrow',
                [types.uint(taskId), types.uint(reward), types.principal(creator.address)],
                deployer.address
            ),
            Tx.contractCall(
                'task-escrow',
                'set-worker',
                [types.uint(taskId), types.principal(worker.address)],
                deployer.address
            ),
            Tx.contractCall(
                'task-escrow',
                'release-funds',
                [types.uint(taskId)],
                deployer.address
            )
        ]);
        
        // Try to release again
        block = chain.mineBlock([
            Tx.contractCall(
                'task-escrow',
                'release-funds',
                [types.uint(taskId)],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectErr().expectUint(202); // ERR-ALREADY-RELEASED
    },
});

Clarinet.test({
    name: "Escrow: Can refund creator",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const creator = accounts.get('wallet_1')!;
        const taskId = 1;
        const reward = 1000000;
        
        let block = chain.mineBlock([
            Tx.contractCall(
                'task-escrow',
                'authorize-contract',
                [types.principal(deployer.address)],
                deployer.address
            )
        ]);
        
        // Deposit escrow
        block = chain.mineBlock([
            Tx.contractCall(
                'task-escrow',
                'deposit-escrow',
                [types.uint(taskId), types.uint(reward), types.principal(creator.address)],
                deployer.address
            )
        ]);
        
        const creatorBalanceBefore = chain.getAssetsMaps().assets['STX'][creator.address];
        
        // Refund creator
        block = chain.mineBlock([
            Tx.contractCall(
                'task-escrow',
                'refund-creator',
                [types.uint(taskId)],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Verify released status
        let query = chain.callReadOnlyFn(
            'task-escrow',
            'get-escrow',
            [types.uint(taskId)],
            deployer.address
        );
        
        const escrow = query.result.expectOk().expectSome().expectTuple();
        assertEquals(escrow['released'], types.bool(true));
        
        // Verify creator received refund
        const creatorBalanceAfter = chain.getAssetsMaps().assets['STX'][creator.address];
        assertEquals(creatorBalanceAfter, creatorBalanceBefore + reward);
    },
});

Clarinet.test({
    name: "Escrow: Can open dispute",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const creator = accounts.get('wallet_1')!;
        const taskId = 1;
        const reward = 1000000;
        
        let block = chain.mineBlock([
            Tx.contractCall(
                'task-escrow',
                'authorize-contract',
                [types.principal(deployer.address)],
                deployer.address
            )
        ]);
        
        block = chain.mineBlock([
            Tx.contractCall(
                'task-escrow',
                'deposit-escrow',
                [types.uint(taskId), types.uint(reward), types.principal(creator.address)],
                deployer.address
            )
        ]);
        
        // Open dispute
        block = chain.mineBlock([
            Tx.contractCall(
                'task-escrow',
                'open-dispute',
                [types.uint(taskId)],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Verify dispute status
        let query = chain.callReadOnlyFn(
            'task-escrow',
            'get-escrow',
            [types.uint(taskId)],
            deployer.address
        );
        
        const escrow = query.result.expectOk().expectSome().expectTuple();
        assertEquals(escrow['dispute-opened'], types.bool(true));
    },
});

Clarinet.test({
    name: "Escrow: Cannot open dispute twice",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const creator = accounts.get('wallet_1')!;
        const taskId = 1;
        const reward = 1000000;
        
        let block = chain.mineBlock([
            Tx.contractCall(
                'task-escrow',
                'authorize-contract',
                [types.principal(deployer.address)],
                deployer.address
            )
        ]);
        
        block = chain.mineBlock([
            Tx.contractCall(
                'task-escrow',
                'deposit-escrow',
                [types.uint(taskId), types.uint(reward), types.principal(creator.address)],
                deployer.address
            ),
            Tx.contractCall(
                'task-escrow',
                'open-dispute',
                [types.uint(taskId)],
                deployer.address
            )
        ]);
        
        // Try to open dispute again
        block = chain.mineBlock([
            Tx.contractCall(
                'task-escrow',
                'open-dispute',
                [types.uint(taskId)],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectErr().expectUint(206); // ERR-DISPUTE-ALREADY-OPENED
    },
});

Clarinet.test({
    name: "Escrow: Can resolve dispute with split",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const creator = accounts.get('wallet_1')!;
        const worker = accounts.get('wallet_2')!;
        const taskId = 1;
        const reward = 1000000;
        const workerPercentage = 60; // Worker gets 60%
        
        let block = chain.mineBlock([
            Tx.contractCall(
                'task-escrow',
                'authorize-contract',
                [types.principal(deployer.address)],
                deployer.address
            )
        ]);
        
        block = chain.mineBlock([
            Tx.contractCall(
                'task-escrow',
                'deposit-escrow',
                [types.uint(taskId), types.uint(reward), types.principal(creator.address)],
                deployer.address
            ),
            Tx.contractCall(
                'task-escrow',
                'set-worker',
                [types.uint(taskId), types.principal(worker.address)],
                deployer.address
            ),
            Tx.contractCall(
                'task-escrow',
                'open-dispute',
                [types.uint(taskId)],
                deployer.address
            )
        ]);
        
        const workerBalanceBefore = chain.getAssetsMaps().assets['STX'][worker.address];
        const creatorBalanceBefore = chain.getAssetsMaps().assets['STX'][creator.address];
        
        // Resolve dispute
        block = chain.mineBlock([
            Tx.contractCall(
                'task-escrow',
                'resolve-dispute',
                [types.uint(taskId), types.uint(workerPercentage)],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        
        // Verify balances
        const workerBalanceAfter = chain.getAssetsMaps().assets['STX'][worker.address];
        const creatorBalanceAfter = chain.getAssetsMaps().assets['STX'][creator.address];
        
        const workerAmount = Math.floor((reward * workerPercentage) / 100);
        const creatorAmount = reward - workerAmount;
        
        assertEquals(workerBalanceAfter, workerBalanceBefore + workerAmount);
        assertEquals(creatorBalanceAfter, creatorBalanceBefore + creatorAmount);
    },
});

Clarinet.test({
    name: "Escrow: Platform fees are collected",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const creator = accounts.get('wallet_1')!;
        const taskId = 1;
        const reward = 1000000;
        const expectedFee = 25000; // 2.5%
        
        let block = chain.mineBlock([
            Tx.contractCall(
                'task-escrow',
                'authorize-contract',
                [types.principal(deployer.address)],
                deployer.address
            )
        ]);
        
        // Check fees before
        let query = chain.callReadOnlyFn(
            'task-escrow',
            'get-platform-fees',
            [],
            deployer.address
        );
        
        const feesBefore = query.result.expectOk();
        
        // Deposit escrow
        block = chain.mineBlock([
            Tx.contractCall(
                'task-escrow',
                'deposit-escrow',
                [types.uint(taskId), types.uint(reward), types.principal(creator.address)],
                deployer.address
            )
        ]);
        
        // Check fees after
        query = chain.callReadOnlyFn(
            'task-escrow',
            'get-platform-fees',
            [],
            deployer.address
        );
        
        const feesAfter = query.result.expectOk();
        assertEquals(feesAfter, types.uint(expectedFee));
    },
});

Clarinet.test({
    name: "Escrow: Owner can withdraw platform fees",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const creator = accounts.get('wallet_1')!;
        const recipient = accounts.get('wallet_3')!;
        const taskId = 1;
        const reward = 1000000;
        const expectedFee = 25000;
        
        let block = chain.mineBlock([
            Tx.contractCall(
                'task-escrow',
                'authorize-contract',
                [types.principal(deployer.address)],
                deployer.address
            )
        ]);
        
        // Deposit escrow to generate fees
        block = chain.mineBlock([
            Tx.contractCall(
                'task-escrow',
                'deposit-escrow',
                [types.uint(taskId), types.uint(reward), types.principal(creator.address)],
                deployer.address
            )
        ]);
        
        const recipientBalanceBefore = chain.getAssetsMaps().assets['STX'][recipient.address];
        
        // Withdraw fees
        block = chain.mineBlock([
            Tx.contractCall(
                'task-escrow',
                'withdraw-platform-fees',
                [types.principal(recipient.address)],
                deployer.address
            )
        ]);
        
        block.receipts[0].result.expectOk().expectUint(expectedFee);
        
        // Verify recipient received fees
        const recipientBalanceAfter = chain.getAssetsMaps().assets['STX'][recipient.address];
        assertEquals(recipientBalanceAfter, recipientBalanceBefore + expectedFee);
        
        // Verify fees are reset to 0
        let query = chain.callReadOnlyFn(
            'task-escrow',
            'get-platform-fees',
            [],
            deployer.address
        );
        
        query.result.expectOk().expectUint(0);
    },
});

Clarinet.test({
    name: "Escrow: Non-owner cannot withdraw fees",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        const recipient = accounts.get('wallet_2')!;
        
        let block = chain.mineBlock([
            Tx.contractCall(
                'task-escrow',
                'withdraw-platform-fees',
                [types.principal(recipient.address)],
                wallet1.address
            )
        ]);
        
        block.receipts[0].result.expectErr().expectUint(200); // ERR-NOT-AUTHORIZED
    },
});
