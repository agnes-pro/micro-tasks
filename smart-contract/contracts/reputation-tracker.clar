;; Reputation Tracker Contract
;; Manages user reputation scores for both workers and task creators

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INVALID-RATING (err u101))
(define-constant ERR-USER-NOT-FOUND (err u102))
(define-constant ERR-INVALID-CALLER (err u103))

;; Rating bounds
(define-constant MIN-RATING u1)
(define-constant MAX-RATING u5)

;; Reputation calculation weights
(define-constant COMPLETED-TASK-WEIGHT u100)
(define-constant RATING-WEIGHT u200)
(define-constant DISPUTE-LOST-PENALTY u300)
(define-constant DISPUTE-WON-BONUS u50)

;; Data Maps
(define-map user-reputation
    { user: principal }
    {
        total-tasks-completed: uint,
        total-tasks-created: uint,
        total-ratings: uint,
        sum-ratings: uint,
        disputes-opened: uint,
        disputes-won: uint,
        disputes-lost: uint,
        total-earned: uint,
        total-spent: uint
    }
)

;; Authorization map for allowed contract callers
(define-map authorized-contracts principal bool)

;; Initialize authorization
(map-set authorized-contracts CONTRACT-OWNER true)

;; Read-only functions

(define-read-only (get-reputation (user principal))
    (let (
        (user-stats (default-to 
            {
                total-tasks-completed: u0,
                total-tasks-created: u0,
                total-ratings: u0,
                sum-ratings: u0,
                disputes-opened: u0,
                disputes-won: u0,
                disputes-lost: u0,
                total-earned: u0,
                total-spent: u0
            }
            (map-get? user-reputation { user: user })
        ))
    )
    (ok (calculate-reputation-score user-stats)))
)

(define-read-only (get-user-stats (user principal))
    (ok (default-to 
        {
            total-tasks-completed: u0,
            total-tasks-created: u0,
            total-ratings: u0,
            sum-ratings: u0,
            disputes-opened: u0,
            disputes-won: u0,
            disputes-lost: u0,
            total-earned: u0,
            total-spent: u0
        }
        (map-get? user-reputation { user: user })
    ))
)

(define-read-only (get-average-rating (user principal))
    (let (
        (user-stats (unwrap! (map-get? user-reputation { user: user }) (ok u0)))
        (total-ratings (get total-ratings user-stats))
        (sum-ratings (get sum-ratings user-stats))
    )
    (if (> total-ratings u0)
        (ok (/ (* sum-ratings u100) total-ratings))
        (ok u0)
    ))
)

(define-read-only (get-completion-rate (user principal))
    (let (
        (user-stats (unwrap! (map-get? user-reputation { user: user }) (ok u0)))
        (completed (get total-tasks-completed user-stats))
        (created (get total-tasks-created user-stats))
        (total (+ completed created))
    )
    (if (> total u0)
        (ok (/ (* completed u10000) total))
        (ok u0)
    ))
)

(define-read-only (is-authorized-contract (contract principal))
    (ok (default-to false (map-get? authorized-contracts contract)))
)

;; Private functions

(define-private (calculate-reputation-score (stats (tuple 
    (total-tasks-completed uint)
    (total-tasks-created uint)
    (total-ratings uint)
    (sum-ratings uint)
    (disputes-opened uint)
    (disputes-won uint)
    (disputes-lost uint)
    (total-earned uint)
    (total-spent uint)
)))
    (let (
        (completed-score (* (get total-tasks-completed stats) COMPLETED-TASK-WEIGHT))
        (avg-rating-score (if (> (get total-ratings stats) u0)
            (/ (* (get sum-ratings stats) RATING-WEIGHT) (get total-ratings stats))
            u0
        ))
        (dispute-penalty (* (get disputes-lost stats) DISPUTE-LOST-PENALTY))
        (dispute-bonus (* (get disputes-won stats) DISPUTE-WON-BONUS))
        (raw-score (+ (+ completed-score avg-rating-score) dispute-bonus))
    )
    (if (> raw-score dispute-penalty)
        (- raw-score dispute-penalty)
        u0
    ))
)