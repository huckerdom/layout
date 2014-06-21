-- Layout A playmaker for Ultimate.

-- Provides a standard playing field
-- Allow users to choose the players and choose their positions.
-- Move them around and record steps.
-- Save the steps, and replay them.

import Drawing (drawState)
import Models (State)

initialState : State
initialState = {
               disc={position=(0, 0)},
               defense=[],
               offense=[],
               field={height=370, width=1000, color=(rgba 0 255 0 1.0)}
               }

main : Element
main = collage 1000 370 [drawState initialState]
