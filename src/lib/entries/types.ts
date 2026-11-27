import type { ElectiveReview, HospitalReview, NoteEntry } from "@/lib/data/types";

export type Kind = "elective" | "hospital" | "note";
export type Status = "pending" | "approved" | "rejected";
export type EntryData = Omit<ElectiveReview, "id"> | Omit<HospitalReview, "id"> | Omit<NoteEntry, "id">;

export interface NewEntry {
  kind: Kind;
  status: Status;
  source: "import" | "form";
  /** The id the review had in the imported file. */
  importId?: string;
  data: EntryData;
  createdAt: Date;
}

export interface Entry extends NewEntry {
  id: string;
}

/** Where on the roadmap a review belongs. */
export interface Where {
  specialtyId?: string | null;
  trackId?: string;
  stepId?: string;
}

/** The few fields needed to count and name entries, without their text. */
export interface Place extends Where {
  kind: Kind;
  hospital?: string;
}

export interface EntryStore {
  /** Oldest first. */
  list(status: Status, kind?: Kind, where?: Where): Promise<Entry[]>;
  places(status: Status): Promise<Place[]>;
  /** Null for an unknown, malformed or deleted id. */
  get(id: string): Promise<Entry | null>;
  insert(entry: NewEntry): Promise<string>;
  /** False if the entry is gone; nothing is created. */
  update(id: string, patch: { status?: Status; data?: EntryData }): Promise<boolean>;
  /** An imported entry leaves only its importId behind, so a later import cannot bring it back. */
  remove(id: string): Promise<boolean>;
  count(status: Status): Promise<number>;
  /** False if this importId was ever seen. */
  addImport(entry: NewEntry & { importId: string }): Promise<boolean>;
}

export interface RateStore {
  /** Hits for this key inside the window, including this one. */
  hit(key: string, windowMs: number): Promise<number>;
}
