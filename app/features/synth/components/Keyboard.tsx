"use client"

import { memo } from "react"

const notes = [
  { name: "C4", freq: 261.63 },
  { name: "D4", freq: 293.66 },
  { name: "E4", freq: 329.63 },
  { name: "F4", freq: 349.23 },
  { name: "G4", freq: 392.00 },
  { name: "A4", freq: 440.00 },
  { name: "B4", freq: 493.88 },
]

type KeyboardProps = {
  onNoteDown: (frequency: number) => void
  onNoteUp: () => void
}

function Keyboard({ onNoteDown, onNoteUp }: KeyboardProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 rounded-lg bg-zinc-800 p-4">
      {notes.map((note) => (
        <button
          key={note.name}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            onNoteDown(note.freq)
          }}
          onPointerUp={onNoteUp}
          onPointerCancel={onNoteUp}
          className="h-28 w-14 rounded-md border border-zinc-600 bg-zinc-100 text-zinc-900 transition hover:bg-white"
        >
          {note.name}
        </button>
      ))}
    </div>
  )
}

export default memo(Keyboard)
