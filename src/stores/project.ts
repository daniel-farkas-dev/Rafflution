import { defineStore } from 'pinia';
import type { projectDocument } from 'assets/utilities';
import type { DocumentReference } from 'firebase/firestore';
import { arrayUnion, serverTimestamp, updateDoc } from 'firebase/firestore';
import { participant } from 'assets/utilities';
import { arrayRemove } from '@firebase/firestore';

export const useProjectStore = defineStore('project', {
  state: () => ({
    project: null as projectDocument | null,
    docRef: null as DocumentReference<projectDocument> | null,
  }),

  getters: {},

  actions: {
    setProject(
      project: projectDocument,
      docRef: DocumentReference<projectDocument>
    ) {
      this.project = project;
      this.docRef = docRef;
    },
    deleteProject() {
      this.project = null;
    },
    async togglePresence(index: number) {
      const term = this.project?.info.term;
      if (term && this.project?.participants[index] && this.docRef) {
        let temp = this.project?.participants[index].timesCame;
        const present =
          this.project?.participants[index].timesCame.includes(term);
        if (present) {
          temp = this.project?.participants[index].timesCame.filter(
            (t) => t !== term
          );
        } else {
          temp.push(term);
        }
        await updateDoc(this.docRef, {
          participants: this.project.participants.map((el, i) => {
            if (i === index) {
              return {
                ...el,
                timesCame: temp,
              };
            }
            return el;
          }),
          'info.lastEdited': serverTimestamp(),
        });
      } else {
        console.error('Missing Data');
      }
    },
    async addParticipant(participant: participant) {
      if (
        !this.isAgeReal(participant.age) &&
        !this.isAllowedName(participant.name) &&
        !this.isNewName(participant.name)
      ) {
        console.error('Invalid Data for Participant');
        return;
      }
      participant.timesCame.push(this.project?.info.term as number);
      if (participant.age != undefined) {
        participant.age = participant.age - 0; //Remove leading zeros
      } else {
        delete participant.age;
      }
      await updateDoc(this.docRef as DocumentReference<projectDocument>, {
        participants: arrayUnion(participant),
      });
    },
    async editParticipant(index: number, participant: participant) {
      if (
        !this.isAgeReal(participant.age) &&
        !this.isAllowedName(participant.name) &&
        !this.isNewName(participant.name)
      ) {
        console.error('Invalid Data for Participant');
        return;
      }
      if (participant.age != undefined) {
        participant.age = participant.age - 0; //Remove leading zeros
      } else {
        delete participant.age;
      }
      if (this.project?.participants == undefined) {
        console.error('Participants not defined');
        return;
      }
      const newArr = this.project?.participants;
      newArr[index] = participant;
      await updateDoc(this.docRef as DocumentReference<projectDocument>, {
        participants: newArr,
      });
    },
    async deleteParticipant(index: number) {
      console.log('Attempted Deletion');
      await updateDoc(this.docRef as DocumentReference<projectDocument>, {
        participants: arrayRemove(this.project?.participants[index]),
      });
    },
    isNewName(name: string, currentName?: string) {
      if (name == currentName) {
        return true;
      }
      return !this.project?.participants.some((el) => el.name === name);
    },
    isAgeReal(age: number | undefined) {
      return age == undefined || (age >= 0 && age <= 120);
    },
    isAllowedName(name: string) {
      //Check if only letters numbers and spaces and dashes
      return /^[a-zA-Z0-9 -]*$/.test(name);
    },
  },
});
