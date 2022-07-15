//require('dotenv').config()
//const node =  require('node')
//import axios from 'axios';

const ENDPOINT_URL = "http://192.168.235.81:8080";
new Vue({
    el: "#app",
    data: {
        //Array de ops que parseamos desde el fichero json
        //ops: [],
        toProduce: [],
        //Array del fetch de json de empresas
        orders: [],

        //Objeto que guarda la empresa que esta selecionada en el select
        selectedOrder: {
            id: '',
            nomfiscli: '',
            serie: '',
            tipo: '',
            centro: '',
            numero: '',
        },
        ops: [],

        selectedOP: {
            centro: "",
            tipo: 0,
            serie: "",
            numero: 0,
            codiart: "",
            cantidad: 0,
            denoart: "",
            fondo: "",
            lateral: "",
            tapa: ""
        },
        opEnviar: {
            centro: "",
            tipo: 0,
            serie: "",
            numero: 0,
            tipoEnviar: "",
            valor: false
        },
        //Loading atributes
        loadingValue: "Cargando.....",
        
        //Button atributes
        isDisabled: true,
    },
    /*Metodos que se ejecutan al iniciar la pagina*/
    created() {        
        this.reloadAll();
    },
    methods: {
        reloadAll:function(){
            const getOrdersExecution = new Promise((resolve, reject) => {
                resolve(this.getOrders());
            });
            getOrdersExecution
                .then(value => {
                    if (this.orders.length === 0) {
                        document.getElementById("ops").style.display = "block";
                        document.getElementById("ops").innerHTML = '<h4 class="text-center"> No hay pedidos </h4>';
                        document.getElementById("reload").style.display = "none";
                    }
                    this.setDefault(this.orders[0])
                })
                .catch(err => {
                    console.log("NO SE PUEDEN OBTENER LOS PEDIDOS! " + err);
                })
        },
        comprobarVerde: function (op) {
            //enviar objecto de post
            if (op.fondo === 'S' && op.lateral === 'S' && op.tapa === 'S') {
                return true;
            }else if (op.fondo === 'S' && op.lateral === 'S' && op.tapa === 'N'){
                return true;
            }
        
        },
        sendOP: function (op) {
            //Comprueba que elementos li estan marcados en verde
            this.toProduce.push(op)

        },
        deleteOP: function (op) {
            for (let i = 0; i < this.toProduce.length; i++) {
                if (this.toProduce[i] === op) {
                    this.toProduce[i] = null;
                }
            }
            this.deleteNullsFromArray();
       },
        deleteNullsFromArray: function () {
            //Eliminar las posiciones que son nulas
            this.toProduce = this.toProduce.filter(element => {
                return element !== null;
            });
        },
        /**
         *
         * 
         */
         closeProduction: async function () {
            let toProduceArray = this.toProduce;
            //Cambiamos el valor del boton y lo bloqueamos
            console.log("ESTAAA" + toProduceArray)
            this.loadingValue = 'Enviando.....'
            this.isDisabled = true;
            document.getElementById("ops").style.display = "none";
            document.getElementById("reload").style.display = "block";
            //Envia a PEP todas los objectos que van a producion
            //const url = "http://localhost:8080/kriterOMNI/KriterRS004/closeOP";
            try {
                await axios.post(ENDPOINT_URL+"/kriterOMNI/KriterRS004/closeOP", toProduceArray)
                    .then(response => {


                        //this.getOrders();
                        console.log("EL length es " + this.orders.length)
                        //this.setDefault(this.orders[0])
                        if (response.status === 200) {
                            this.getOps();
                            //Si la array actual es del mismo length que la nueva la seteamos a 0
                            this.isDisabled = false;
                            document.getElementById("ops").style.display = "block";
                            document.getElementById("reload").style.display = "none";


                        }

                        console.log("EL length es " + this.orders.length);
                        let actualLength = this.ops.length - this.toProduce.length;
                        console.log("EL length es " + actualLength);      
                        
                        
                        console.log("EL actual length es: " + actualLength)
                        if(actualLength == 0){
                            console.log("estoy aquiiiiI!!!")
                            this.reloadAll();
                        }
                    //this.displayReload(data.status);
                    })
                this.isDisabled = true;
            }
            catch (error) {
                console.log("El error que devuelve es: " + error.data);
            }

            this.refreshOps();
            //this.refreshOrders();
            this.loadingValue = "Cargando....."

        },
        refreshOps: function () {
            this.toProduce = [];
            this.ops = [];
            this.getOps();
        },
        refreshOrders: function () {
            console.log(this.ops);
            
            this.orders = [];
            this.getOrders();
            this.setDefault(this.orders[0]);
        },
        filter: function (a) {
            let ideProducto = a.centro + a.tipo + a.serie + a.numero;
            return ideProducto.toUpperCase() === this.selectedOrder.id.toUpperCase();
        },
        setSelected: function (orderObject) {
            //console.log("cambiando  ->" + )
            //Sacamos una array separando por '/' en cada uno de las posiciones
            //let atributos = this.currentOrder.id.split('/')
            //console.log(atributos);
            //Recorrer la array
            this.setDefault(orderObject);
        },
        setDefault: function (order) {
            this.selectedOrder = order;
            this.selectedOrder.id = this.selectedOrder.centro + this.selectedOrder.tipo + this.selectedOrder.serie +
                this.selectedOrder.numero;
            this.getOps();
            const getOrdersExecution =
                new Promise((resolve, reject) => {
                    resolve(this.getOps());
                });
            getOrdersExecution.then((value) => {
                this.toOPDefault();
            });


        },
        toOPDefault: function () {
            console.log(this.ops);
            if (this.ops.length >= 1) {
                this.ops.forEach(op => {
                    console.log(op)
                    if (this.comprobarVerde(op) === true) {
                        this.toProduce.push(op);
                        this.isDisabled = false;
                    }
                });
            }

        },

        beforePost: function (op, tipo) {
            //Vamos a poner en el selected op actual los valores de de cada uno de los tipos...

            this.selectedOP = op;
            if (tipo === 'fondo') {
                if (event.target.checked === true) {
                    this.selectedOP.fondo = 'S';
                } else {
                    this.selectedOP.fondo = 'X';
                }
            }
            if (tipo === 'lateral') {
                if (event.target.checked === true) {
                    this.selectedOP.lateral = 'S';
                } else {
                    this.selectedOP.lateral = 'X';
                }
            }
            if (tipo === 'tapa') {
                if (event.target.checked === true) {
                    this.selectedOP.tapa = 'S';
                } else {
                    this.selectedOP.tapa = 'X';
                }
            }

            this.enableOP();
            
            console.log("*************" + this.selectedOP);
            //this.comprobarVerde(this.selectedOP);
            if (this.comprobarVerde(this.selectedOP) === true) {
                this.sendOP(this.selectedOP);
            } else {
                this.deleteOP(this.selectedOP);
            }
            console.log(event.target.checked);
            this.opEnviar.centro = op.centro;
            this.opEnviar.serie = op.serie;
            this.opEnviar.tipo = op.tipo;
            this.opEnviar.numero = op.numero;
            this.opEnviar.tipoEnviar = tipo;
            this.opEnviar.valor = event.target.checked;
            //console.log(this.opEnviar);

            this.postOP();
        },
        postOP: async function () {
            //Hay que pasar el estado en que se encuentra el check

            //const url = "http://localhost:8080/kriterOMNI/KriterRS004/marcarFase";
            try {
                await axios.post(ENDPOINT_URL + "/kriterOMNI/KriterRS004/marcarFase", this.opEnviar)
                    .then(data => {
                        console.log(data);
                    })


            } catch (error) {
                console.log(error.response);
            }


        },
        checkEnable: function (){
            
            for(let i = 0; i<this.ops.length; i++){
                if(this.comprobarVerde(this.ops[i])){
                    return true;
                }
            }
            return false;
        },

        enableOP: function () {
            this.isDisabled = !this.checkEnable()
        },
        displayReload: async function (status) {
            if (status == 200) {

                document.getElementById("ops").style.display = "block";
                document.getElementById("reload").style.display = "none";
            } else {

                document.getElementById("ops").style.display = "none";
                document.getElementById("reload").style.display = "block";
            }
        },
        
        getOps: async function () {

            try {
                //const url = "http://localhost:8080/kriterOMNI/KriterRS004/getOP?centro=" + this.selectedOrder.centro + "&tipo=" + this.selectedOrder.tipo
                //    + "&serie=" + this.selectedOrder.serie + "&numero=" + this.selectedOrder.numero;

                //const url = '../data/products.json';

                const response = await axios(ENDPOINT_URL + "/kriterOMNI/KriterRS004/getOP?centro=" + this.selectedOrder.centro + "&tipo=" + this.selectedOrder.tipo
                + "&serie=" + this.selectedOrder.serie + "&numero=" + this.selectedOrder.numero);
                const res = response.data;

                this.ops = [];
                
                this.toProduce = [];
                //TODO
                this.ops = res;

                /*Activar el boton o no dependiendo de si hay algun metodo en verde*/
                console.log("El valor de check enabled es: " + this.checkEnable());
                if(this.checkEnable()){
                    this.isDisabled = false;
                }else{
                    this.isDisabled = true;
                }    

                //Si la respeusta es 200 ponemos display none a la rueda y display true a los productos

                if (response.status === 200) {
                    document.getElementById("ops").style.display = "block";
                    document.getElementById("reload").style.display = "none";
                } else {
                    document.getElementById("ops").style.display = "none";
                    document.getElementById("reload").style.display = "block";
                }

            } catch (err) {
                console.log(err);
            }
        },

        getOrders: async function () {


            try {
                //const url = "http://localhost:8080/kriterOMNI/KriterRS004/getOrders";
                //const url = "http://localhost:8080/kriterOMNI/KriterRS004/getOrders";

                //const url = '../data/orders.json'
                const response = await axios(ENDPOINT_URL + "/kriterOMNI/KriterRS004/getOrders");

                const res = response.data;
                this.orders = [];

                this.orders = res;


            } catch (err) {
                console.log("NO SE PUEDEN OBTENER LOS PEDIDOS!" + err);
            }
        }


    },
});


