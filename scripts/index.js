// ! CAMBIAR A PROPIO ENDPOINT
const ENDPOINT_URL = "http://192.168.235.81:8080";
new Vue({
    el: "#app",
    data: {
        /**
         * TODAS LAS VARIABLES USADAS.
         * - toProduce: Articulos que se van a enviar al backEND.
         * - orders: Ordenes cargadas desde la base de datos.
         * - selectedOrder: Orden seleccionada para ser editada.
         * - ops: OPS que se cargan desde el backEND.
         * - selectedOP: El OP seleccionado que enviamos a bdd cada vez que se clica en un check.
         * - loadingValue: Valor que se muestra en el loading.
         * - isDisabled: Si esta deshabilitado el boton de enviar.
         * @typedef {{toProduce: Array, orders: Array, selectedOrder: Object,
         *            ops: Array,opEnviar:Object,loadingValue:String,isDisabled:Boolean,}}
         */
                
        toProduce: [],        
        orders: [],        
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
        loadingValue: "Cargando.....",
        
        isDisabled: true,
    },
    /**
     * - created: Funcion que se ejecuta al iniciar la aplicacion.
     */
    created() {
        this.reloadAll();
    },
    /**
     * - methods: Funciones que se ejecutan en el componente.
     */
    methods: {
        /**
         * - reloadAll: Carga la lista de ordenes y pone por defecto la primera.
         */

        reloadAll: function () {
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
        /**
         * 
         * @param {*} op 
         * @returns true si el op cumple las condiciones para estar en verde, false si no.
         */
        comprobarVerde: function (op) {            
            if (op.fondo === 'S' && op.lateral === 'S' && op.tapa === 'S') {
                return true;
            } else if (op.fondo === 'S' && op.lateral === 'S' && op.tapa === 'N') {
                return true;
            }

        },
        /**
         * 
         * @param {*} op
         * - Comprobar si el op esta en verde o no. 
         */
        sendOP: function (op) {
            //Comprueba que elementos li estan marcados en verde
            this.toProduce.push(op)
        },
        /**
         * - Metodo OPCIONAL
         * @param {*} op
         * - Elimina el op de la lista de los que se van a enviar. 
         */
        deleteOP: function (op) {
            for (let i = 0; i < this.toProduce.length; i++) {
                if (this.toProduce[i] === op) {
                    this.toProduce[i] = null;
                }
            }
            this.deleteNullsFromArray();
        },
        /**
         * - Elimina los nulls de la lista de los que se van a enviar.
         */
        deleteNullsFromArray: function () {
            //Eliminar las posiciones que son nulas
            this.toProduce = this.toProduce.filter(element => {
                return element !== null;
            });
        },
        /**
         *
         * - Envia un post con todos los ops que estan en verde, si la lista de ops esta vacia vuelve a llamar a la funcion reloadAll().
         */
        closeProduction: async function () {
            let toProduceArray = this.toProduce;
            this.loadingValue = 'Enviando.....'
            this.isDisabled = true;
            document.getElementById("ops").style.display = "none";
            document.getElementById("reload").style.display = "block";
            try {
                await axios.post(ENDPOINT_URL + "/kriterOMNI/KriterRS004/closeOP", toProduceArray)
                    .then(response => {
                        if (response.status === 200) {
                            this.getOps();
                            this.isDisabled = false;
                            document.getElementById("ops").style.display = "block";
                            document.getElementById("reload").style.display = "none";
                        }
                        let actualLength = this.ops.length - this.toProduce.length;
                        if (actualLength == 0) {
                            this.reloadAll();
                        }
                    })
                this.isDisabled = true;
            }
            catch (error) {
                console.log("El error que devuelve es: " + error.data);
            }
            this.refreshOps();
            this.loadingValue = "Cargando....."

        },
        /**
         * - Llama a la funcion getOps() para que se carguen los ops desde el backEND.
         */
        refreshOps: function () {
            this.toProduce = [];
            this.ops = [];
            this.getOps();
        },
        /**
         * - Llama a la funcion getOrders() para que se carguen las ordenes desde el backEND.
         */
        refreshOrders: function () {
            this.orders = [];
            this.getOrders();
            this.setDefault(this.orders[0]);
        },
        /**
         * 
         * @param {*} a 
         * @returns EL ide de cada OP con la suma de centro tipo serie y numero.
         */
        filter: function (a) {
            let ideProducto = a.centro + a.tipo + a.serie + a.numero;
            return ideProducto.toUpperCase() === this.selectedOrder.id.toUpperCase();
        },
        /**
         * 
         * @param {*} orderObject
         * - Llama a la funcion setDefault() para que se ponga por defecto la primera op de la lista. 
         */
        setSelected: function (orderObject) {
            this.setDefault(orderObject);
        },
        /**
         * 
         * @param {*} order
         * - Pone por defecto la primera op de la lista. 
         */

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
        /**
         * - OPCIONAL
         */
        toOPDefault: function () {
            if (this.ops.length >= 1) {
                this.ops.forEach(op => {

                    if (this.comprobarVerde(op) === true) {
                        this.toProduce.push(op);
                        this.isDisabled = false;
                    }
                });
            }
        },
        /**
         * 
         * @param {*} op 
         * @param {*} tipo
         * - Se ejecuta antes de enviar el post de produccion, checkea que todo este correcto antes de hacer el post.  
         */
        beforePost: function (op, tipo) {
            
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
            
            if (this.comprobarVerde(this.selectedOP) === true) {
                this.sendOP(this.selectedOP);
            } else {
                this.deleteOP(this.selectedOP);
            }

            this.opEnviar.centro = op.centro;
            this.opEnviar.serie = op.serie;
            this.opEnviar.tipo = op.tipo;
            this.opEnviar.numero = op.numero;
            this.opEnviar.tipoEnviar = tipo;
            this.opEnviar.valor = event.target.checked;

            this.postOP();
        },
        /**
         * - Post de cada OP al que hace el check.
         */
        postOP: async function () {
            
            try {
                await axios.post(ENDPOINT_URL + "/kriterOMNI/KriterRS004/marcarFase", this.opEnviar)
                    .then(data => {
                        console.log(data);
                    })

            } catch (error) {
                console.log(error.response);
            }

        },
        /**
         * 
         * @returns true si todos la lista de OPS actual es verde, sino returna false.
         */
        checkEnable: function () {
            for (let i = 0; i < this.ops.length; i++) {
                if (this.comprobarVerde(this.ops[i])) {
                    return true;
                }
            }
            return false;
        },
        /**
         * - Habilita el button
         */
        enableOP: function () {
            this.isDisabled = !this.checkEnable()
        },
        /**
         * 
         * @param {*} status
         * Si el status es 200 habilita el boton y sino no lo habilita. 
         */
        displayReload: async function (status) {
            if (status == 200) {
                document.getElementById("ops").style.display = "block";
                document.getElementById("reload").style.display = "none";
            } else {
                document.getElementById("ops").style.display = "none";
                document.getElementById("reload").style.display = "block";
            }
        },
        /**
         * - Getter de la lista de Ops.
         */
        getOps: async function () {
            try {                
                const response = await axios(ENDPOINT_URL + "/kriterOMNI/KriterRS004/getOP?centro=" + this.selectedOrder.centro + "&tipo=" + this.selectedOrder.tipo
                    + "&serie=" + this.selectedOrder.serie + "&numero=" + this.selectedOrder.numero);
                const res = response.data;

                this.ops = [];

                this.toProduce = [];
                
                this.ops = res;

                if (this.checkEnable()) {
                    this.isDisabled = false;
                } else {
                    this.isDisabled = true;
                }                                
                this.displayReload(response.status);
                
            } catch (err) {
                console.log(err);
            }
        },
        /**
         * - Getters de la lista de ordenes.
         */
        getOrders: async function () {
            try {                
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


