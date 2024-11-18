import { Injectable } from '@angular/core';
import { collection, deleteDoc, doc, DocumentData, DocumentReference, Firestore, getDocs, limit, onSnapshot, orderBy, OrderByDirection, query, QueryCompositeFilterConstraint, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ICollection } from '../interfaces/iCollection';
@Injectable({
  providedIn: 'root'
})
export class CollectionsService {
  constructor(private _firestore: Firestore) {
  }

  addOne(collectionName: string, document: ICollection) {
    return new Promise<DocumentReference<DocumentData>>((resolve) => {
      let collectionRef = collection(this._firestore, collectionName);
      let docRef: DocumentReference<DocumentData>;

      if (document.id == "" || document.id == undefined || document.id == null) {
        docRef = doc(collectionRef);
        document.id = docRef.id;
      }
      else {
        docRef = doc(collectionRef, document.id);
      }
      setDoc(docRef, { ...document });
      resolve(docRef);

    });
  }

 async delete(collectionName: string, id: string) {
    return deleteDoc(doc(this._firestore, collectionName, id))
  }

  update(collectionName: string, document: ICollection) {
    let collectionRef = collection(this._firestore, collectionName);
    const newDoc = doc(collectionRef, document.id);
    return updateDoc(newDoc, { ...document });
  }

  getOne(collectionName: string, id: string) {
    let collectionRef = collection(this._firestore, collectionName);
    const document = query(collectionRef, where("id", "==", id));

    return getDocs(document)
  }

  getFirstQuery<T = ICollection>(collectionName: string, querys: QueryCompositeFilterConstraint) {
    let docs = query(collection(this._firestore, collectionName), querys)

    return getDocs(docs).then(res => res.docs.map(doc => doc.data() as T)![0])
  }

  getAllQuery<T = ICollection>(collectionName: string, querys: QueryCompositeFilterConstraint) {
    let docs = query(collection(this._firestore, collectionName), querys)
    return getDocs(docs).then(res => res.docs.map(doc => doc.data() as T))
  }

  getAll(collectionName: string) {
    let collectionRef = collection(this._firestore, collectionName);
    return getDocs(collectionRef).then(res => res.docs.map(doc => doc.data() as ICollection));
  }

  getAllWhere(collectionName: string, column: string, value: any) {
    let docs = query(collection(this._firestore, collectionName), where(column, '==', value))
    return getDocs(docs).then(res => res.docs.map(doc => doc.data() as ICollection));
  }

  getAllWhere2(collectionName: string, querys: QueryCompositeFilterConstraint) {
    let docs = query(collection(this._firestore, collectionName), querys)
    return getDocs(docs).then(res => res.docs.map(doc => doc.data() as ICollection));
  }

  async exists(collectionName: string, column: string, value: any) {
    let docs = query(collection(this._firestore, collectionName), where(column, '==', value))

    return !(await getDocs(docs)).empty;
  }

  async existsQuery(collectionName: string, querys: QueryCompositeFilterConstraint) {
    let docs = query(collection(this._firestore, collectionName), querys)

    return !(await getDocs(docs)).empty;
  }

  getAllWhereSnapshot<T = ICollection>(collectionName: string, querys: QueryCompositeFilterConstraint,order:string,forma:OrderByDirection): Observable<T[]> {


    let docs = query(collection(this._firestore, collectionName), querys, orderBy(order,forma))
    return new Observable(subscriber => {
      const unsubscribe = onSnapshot(docs, querySnapshot => {
        const collection: T[] = [];

        querySnapshot.forEach(doc => {
          const simpleDoc = { ...doc.data() as T };
          collection.push(simpleDoc);
        });

        subscriber.next(collection);
      });

      // Cleanup the listener when unsubscribed
      return () => unsubscribe();
    });


    //return getDocs(docs).then(res => res.docs.map(doc => doc.data() as t));
  }

  getAllSnapshot<T = ICollection>(collectionName: string): Observable<T[]> {
    let docs = query(collection(this._firestore, collectionName))
    return new Observable(subscriber => {
      const unsubscribe = onSnapshot(docs, querySnapshot => {
        const collection: T[] = [];

        querySnapshot.forEach(doc => {
          const simpleDoc = { ...doc.data() as T };
          collection.push(simpleDoc);
        });

        subscriber.next(collection);
      });
    });
  }

  getOneByValue(collectionName: string, key: string, value: string) {
    let collectionRef = collection(this._firestore, collectionName);
    const document = query(collectionRef, where(key, "==", value));

    return getDocs(document)
  }
  
  getAllWhereTop<T = ICollection>(collectionName: string, column: string, value: any, top: number,orderby:string) {
    let docs = query(collection(this._firestore, collectionName), where(column, '==', value), orderBy(orderby, 'asc'), limit(top))
    return getDocs(docs).then(res => res.docs.map(doc => doc.data() as T));  
  }
  
}
