import { Timestamp } from "firebase/firestore";
import { ICollection } from "../interfaces/iCollection";

export class Score implements ICollection {
    constructor(
        public id: string = '',
        public email: string = '',
        public score: number = 0,
        public dificultad: 'facil' | 'medio' | 'dificil' = 'facil',
        public date: Timestamp = Timestamp.now()
    ) { }
}
