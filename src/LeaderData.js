import { initializeApp, getApps } from 'firebase/app';
import { 
  initializeFirestore, collection, getDocs, query, addDoc, limit
} from "firebase/firestore";
import { firebaseConfig } from './Secrets';

let app;
if (getApps().length === 0){
  app = initializeApp(firebaseConfig);
} 
const db = initializeFirestore(app, {
    useFetchStreams: false
});

class Leaderboard {
    constructor(){
        this.collRef = collection(db, 'leaderboard');
        this.leaders = [];
        this.subscribers = [];
        this.asyncInit();
    }
    asyncInit = async () => {
        await this.loadLeaders();
    }
    loadLeaders = async () => {
        const q = query(this.collRef, limit(10));
        const querySnap = await getDocs(q);
        if (querySnap.empty) return;
        querySnap.docs.forEach(qDocSnap => {
          let key = qDocSnap.id;
          let data = qDocSnap.data();
          data.key = key;
          this.leaders.push(data);
        });
        this.updateSubscribers();
    }
    addItem = async (name, score) => {
        const item = {
            name: name,
            score: score,
        };
        let docRef = await addDoc(this.collRef, item);
        item.key = docRef.id;
        this.leaders.push(item);
        this.updateSubscribers();
      }
    subscribeToUpdates(callback) {
        this.subscribers.push(callback);
    }
    updateSubscribers() {
        for (let sub of this.subscribers) {
            sub();
        }
    }
    getLeadersCopy() {
        this.leaders.sort((a, b) => b.score - a.score);
        return Array.from(this.leaders);
    }
}

let theLeaderboard;
export function getLeaderboard() {
    if(!theLeaderboard) {
        theLeaderboard = new Leaderboard();
    }
    return theLeaderboard;
}
