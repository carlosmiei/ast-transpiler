const Teste = require('./class1.js');

const MY_TOKEN = "++";
class Novo extends Teste {
    MY_VALUE = "DIFF"
    
    lista = {
        'test': this.MY_VALUE,
        OLD: 'worked'
    }
    print() {
        console.log(MY_TOKEN);
        console.log(this.MY_VALUE);
        console.log(this.OLD);
        // console.log(this.lista['test']);
        console.log(this.balde['ola']);
    }
}

const novo = new Novo();
novo.print();