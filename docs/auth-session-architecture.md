# Auth Session Architecture

## Estructura propuesta

```text
src/
  app/
    api/
      auth/
        admin/
          session/route.ts
          logout/route.ts
        public/
          login/route.ts
          logout/route.ts
        player/
          session/route.ts
          logout/route.ts
  lib/
    auth/
      admin-session.ts
      backend.ts
      errors.ts
      fetch.ts
      player-session.ts
      public-session.ts
      types.ts
    server/
      backend-proxy.ts
  providers/
    auth-provider.tsx
    player-provider.tsx
```

## Estados de sesión

- `loading`
- `unauthenticated`
- `needs_person_registration`
- `forbidden`
- `authenticated`

## Contrato backend

- `POST /auth/google/public`
- `POST /auth/player-session`
- `POST /auth/admin-session`
- `POST /auth/logout/public`
- `POST /auth/logout/player`
- `POST /auth/logout/admin`

Todos se consumen con `credentials: 'include'` y el frontend no lee JWTs desde JS.

## Público o semi público

- `GET /config`
- `GET /payments/plans`
- `POST /config`
- `POST /payments-suscription/mercadopago/change`
- `DELETE /config/:tenantId/subscription`
- `POST /config/:tenantId/subscription-checkout`
- `POST /message`
- `GET /calender/my-booking?email=...`
- `GET /calender/availability?date=YYYY-MM-DD`
- `POST /calender/bookings`
- `DELETE /calender/bookings/:bookingId`
- `GET /api/plans/status?tenantId=...`
- `GET /config/is-plan-active/:tenantId`
- `GET /config/slug/:slug`
- `GET /player/:slug?email=...`
- `POST /player/:slug`
- `PATCH /player/:personId`

## Requieren player session en esta etapa

- `POST /api/bookings/public/intent`
- `GET /api/billing/bookings/:externalReference`
- `POST /match/entry-intent`
- `GET /match/request/:matchRequestId/status`
- `GET /match/proposals?tenantId=...&phone=...`
- `POST /match/proposals/:proposalId/confirm`
- `POST /match/proposals/:proposalId/reject`
- `POST /match/request/:matchRequestId/cancel`
- `GET /tournament/:tenantId/:tournamentId/player/:playerId/options?categoryId=...`
- `GET /tournament/:tenantId/:tournamentId/eligible-partners?playerId=...&categoryId=...`
- `GET /tournament/:tenantId/:tournamentId/available-players?categoryId=...`
- `POST /tournament/:tenantId/:tournamentId/partner-request`
- `GET /tournament/:tenantId/player/:playerId/partner-requests`
- `POST /tournament/:tenantId/:tournamentId/available-players`
- `DELETE /tournament/available-players/:availablePlayerId`
- `POST /tournament/:tenantId/:tournamentId/pick-available-player`
- `PATCH /tournament/partner-request/:requestId/accept`
- `PATCH /tournament/partner-request/:requestId/reject`
- `POST /api/billing/tournaments/payment-link`
- `GET /api/billing/tournaments/:externalReference`

## Siguen públicos para no romper browse/read-only

- `GET /bookings/:tenantId?date=...`
- `GET /professor/:tenantId`
- `GET /player/tenant/:tenantId`
- `GET /tournament/:tenantId?status=...`
- `GET /tournament/:tenantId/fixture`
