(define-public (record-completion (user principal) (is-worker bool) (rating uint))
    (begin
        ;; Only authorized contracts can call this
        (asserts! (default-to false (map-get? authorized-contracts contract-caller)) ERR-NOT-AUTHORIZED)
        
        ;; Validate rating
        (asserts! (and (>= rating MIN-RATING) (<= rating MAX-RATING)) ERR-INVALID-RATING)
        
        (let (
            (current-stats (get-or-create-user-stats user))
            (new-stats (if is-worker
                (merge current-stats {
                    total-tasks-completed: (+ (get total-tasks-completed current-stats) u1),
                    total-ratings: (+ (get total-ratings current-stats) u1),
                    sum-ratings: (+ (get sum-ratings current-stats) rating)
                })
                (merge current-stats {
                    total-tasks-created: (+ (get total-tasks-created current-stats) u1),
                    total-ratings: (+ (get total-ratings current-stats) u1),
                    sum-ratings: (+ (get sum-ratings current-stats) rating)
                })
            ))
        )
        (ok (map-set user-reputation { user: user } new-stats)))
    )
)

(define-public (record-task-created (creator principal) (amount uint))
    (begin
        ;; Only authorized contracts can call this
        (asserts! (default-to false (map-get? authorized-contracts contract-caller)) ERR-NOT-AUTHORIZED)
        
        (let (
            (current-stats (get-or-create-user-stats creator))
            (new-stats (merge current-stats {
                total-spent: (+ (get total-spent current-stats) amount)
            }))
        )
        (ok (map-set user-reputation { user: creator } new-stats)))
    )
)