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