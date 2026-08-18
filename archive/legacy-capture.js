// Keep a copy of the classic/all-time club pools before current squads overwrite CLUBS.
window.__G38_ALL_TIME_CLUBS__ = Object.fromEntries(
  Object.entries(CLUBS).map(([id, club]) => [
    id,
    {
      ...club,
      players: (club.players || []).map((player) => ({ ...player }))
    }
  ])
);
