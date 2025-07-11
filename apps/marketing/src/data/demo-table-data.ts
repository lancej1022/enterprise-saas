import { faker } from "@faker-js/faker";

export interface Person {
  age: number;
  firstName: string;
  id: number;
  lastName: string;
  progress: number;
  status: "complicated" | "relationship" | "single";
  subRows?: Person[];
  visits: number;
}

function range(len: number) {
  const arr: number[] = [];
  for (let i = 0; i < len; i++) {
    arr.push(i);
  }
  return arr;
}

function newPerson(num: number): Person {
  return {
    id: num,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    age: faker.number.int(40),
    visits: faker.number.int(1000),
    progress: faker.number.int(100),
    // @ts-expect-error - comes from tanstack start boilerplate...
    status: faker.helpers.shuffle<Person["status"]>([
      "relationship",
      "complicated",
      "single",
    ])[0],
  };
}

export function makeData(...lens: number[]) {
  function makeDataLevel(depth = 0): Person[] {
    const len = lens[depth];
    // @ts-expect-error - comes from tanstack start boilerplate...
    return range(len).map((index): Person => {
      return {
        ...newPerson(index),
        subRows: lens[depth + 1] ? makeDataLevel(depth + 1) : undefined,
      };
    });
  }

  return makeDataLevel();
}
