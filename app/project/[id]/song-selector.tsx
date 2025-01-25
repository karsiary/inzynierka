import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Song } from "@/types/supabase"

interface SongSelectorProps {
  songs: Song[]
  selectedSong: string | null
  onSongChange: (songId: string) => void
}

export function SongSelector({ songs, selectedSong, onSongChange }: SongSelectorProps) {
  return (
    <Select value={selectedSong || undefined} onValueChange={onSongChange}>
      <SelectTrigger className="w-[200px] bg-[#252422] border-none text-[#ccc5b9]">
        <SelectValue placeholder="Wybierz piosenkę" />
      </SelectTrigger>
      <SelectContent className="bg-[#252422] border-[#403d39]">
        <SelectItem value="all" className="text-[#fffcf2]">
          Wszystkie piosenki
        </SelectItem>
        {songs.map((song) => (
          <SelectItem key={song.id} value={song.id} className="text-[#fffcf2]">
            {song.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

