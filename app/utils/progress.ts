/**
 * Oblicza postęp piosenki na podstawie jej fazy i statusu
 */
export function getSongProgress(song: { phase: string; status: string }): number {
  if (song.status === "completed") {
    return 100;
  }

  switch (song.phase) {
    case "1": // Preprodukcja
      return 0;
    case "2": // Produkcja
      return 25;
    case "3": // Inżynieria
      return 50;
    case "4": // Publishing
      return 75;
    default:
      return 0;
  }
}

/**
 * Oblicza średni postęp projektu na podstawie postępu wszystkich piosenek
 */
export function calculateProjectProgress(songs: Array<{ phase: string; status: string }>): number {
  if (!songs || songs.length === 0) {
    return 0;
  }

  const songProgresses = songs.map(song => getSongProgress(song));
  return songProgresses.reduce((sum, progress) => sum + progress, 0) / songs.length;
} 