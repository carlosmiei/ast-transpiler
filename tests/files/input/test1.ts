class myClass {

    createString     () {
        return "hello";
    }
    createList() {
        return       [1, 2, 3];
    }
}

const myInstance = new myClass();

let myString = myInstance.createString();


myString += "append";


let myList = myInstance.createList();

myList.push(4)

const myStringLen = myString.length;
const myListLen = myList.length;