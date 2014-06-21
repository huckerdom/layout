module Models where

type Field = {
      width : Float,
      height : Float,
      color : Color
    }

data Side = Offense | Defense

type Player = {
      side : Side,
      position : (Float, Float)
    }

type Disc = {
      position : (Float, Float)
    }

type State = {
      disc : Disc,
      offense : [Player],
      defense : [Player],
      field : Field
    }
