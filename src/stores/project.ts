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
    isEligible(participant: participant) {
      console.log(
        Math.max(...participant.timesWon),
        this.project?.info.resetTerm,
        '<'
      );
      return participant.timesWon.length == 0 ||
        this.project?.info.resetTerm == undefined
        ? true
        : Math.max(...participant.timesWon) < this.project?.info.resetTerm;
    },
    numberOfEligible() {
      return this.project?.participants.filter(
        (el) =>
          this.isEligible(el) &&
          el.timesCame.includes(this.project?.info.term as number)
      ).length;
    },
    drawWinners(num: number): participant[] | [] {
      // Draw the number of winners from the eligible participants that came this term
      // No duplicate winners
      // If there are not enough eligible participants throw an error
      const eligible = this.project?.participants.filter(
        (el) =>
          this.isEligible(el) &&
          el.timesCame.includes(this.project?.info.term as number)
      );
      if (eligible?.length == undefined || eligible.length < num) {
        console.error('Not enough eligible participants');
        return [];
      }
      const winners: participant[] = [];
      for (let i = 0; i < num; i++) {
        const index = Math.floor(Math.random() * eligible.length);
        winners.push(eligible[index]);
        eligible.splice(index, 1);
      }
      return winners;
    },
    async saveWinners(winners: participant[]): Promise<boolean> {
      let success = false;
      const term = this.project?.info.term;
      if (term && this.docRef) {
        await updateDoc(this.docRef, {
          participants: this.project?.participants.map((el) => {
            if (winners.includes(el) && !el.timesWon.includes(term)) {
              return {
                ...el,
                timesWon: [...el.timesWon, term],
              };
            }
            return el;
          }),
          'info.lastEdited': serverTimestamp(),
        })
          .then(() => {
            success = true;
          })
          .catch((err) => {
            console.error(err);
          });
      } else {
        console.error('Missing Data');
      }
      return success;
    },
  },
});
//TODO: Move some actions to getters
