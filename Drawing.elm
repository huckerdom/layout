module Drawing where

import Models (Offense, State)

drawState : State -> Form
drawState {disc, offense, defense, field} =
    let
        drawField = rect field.width field.height |> filled field.color
        drawDisc = circle 3 |> filled (rgba 255 0 0 1.0) |> move disc.position
        drawTeam team = map drawPlayer team |> group
        drawPlayer player = circle 10 |> filled (getColor player) |> move player.position
        getColor player = if player.side == Offense then (rgba 0 0 0 1.0) else (rgba 255 255 255 1.0)
    in
      group [
     drawField,
     drawDisc,
     drawTeam offense,
     drawTeam defense
    ]
