let myApp = angular.module('myApp', []);
myApp.controller('ProyectosCtrl',
    function ($scope, $http) {

        const endpoint = "/api/Proyectos";
        $scope.proyecto = {
            Nombre: "",
            Activo: 1,
            IdProyecto: 0
        };
        $scope.Lista = [];
        $scope.mostrandoForm = false;

        $scope.TituloAccionABMC = { A: 'Agregar Proyecto', B: 'Eliminar Proyecto', M: 'Modificar Proyecto', C: 'Consultar Proyecto', L: null };
        $scope.AccionABMC = 'L';   // inicialmente inicia el el listado (buscar con parametros)
        $scope.Mensajes = { SD: ' No se encontraron registros...', RD: ' Revisar los datos ingresados...' };
        $scope.titulo = $scope.TituloAccionABMC.C;

        $scope.DtoFiltro = {};    // dto con las opciones para buscar en grilla
        $scope.DtoFiltro.Activo = null;
        $scope.PaginaActual = 1;  // inicia pagina 1

        // opciones del filtro activo
        $scope.OpcionesSiNo = [{ Id: null, Nombre: '' }, { Id: true, Nombre: 'SI' }, { Id: false, Nombre: 'NO' }];

        $scope.CargarLista = function () {
            $http.get('/api/Proyectos').then(function (response) {
                $scope.Lista = response.data.Lista;
            });
        }

        ///**FUNCIONES**///
        $scope.Guardar = function () {
            const callbackOk = function (response) {
                $scope.CargarLista();
                $scope.ToggleAddEditForm();
                $scope.limpiarProyecto();
                $scope.titulo = $scope.TituloAccionABMC.C;
            };
            if ($scope.proyecto.Nombre == "" ||
                ($scope.existeProyecto($scope.proyecto) && $scope.proyecto.IdProyecto == 0)) {
                alert("El nombre del proyecto no puede ser uno ya existente o estar vacío");
                return;
            }
            if ($scope.proyecto.IdProyecto == 0)
                $http.post(endpoint, $scope.proyecto).then(callbackOk);
            else
                $http.put(endpoint + "/" + $scope.proyecto.IdProyecto, $scope.proyecto).then(callbackOk);
        };

        $scope.ActivarDesactivar = function (proyecto) {
            var resp = confirm("Esta seguro de " + (proyecto.Activo ? "desactivar" : "activar") + " este proyecto?");
            if (resp) {
                $http.delete(endpoint + "/" + proyecto.IdProyecto).then(function (response) {
                    //alert('Proyecto ' + proyecto.Nombre + " " + (proyecto.Activo ? "desactivado" : "activado"));
                    proyecto.Activo = !proyecto.Activo;
                });

            }
        };

        //Buscar segun los filtros, establecidos en DtoFiltro
        $scope.Buscar = function () {
            alert('Buscando datos...');
        };
        $scope.AgregarBtn = function () {
            $scope.ShowAddEditForm();
            $scope.titulo = $scope.TituloAccionABMC.A;
        };

        $scope.EditarBtn = function (proyecto) {
            $scope.ShowAddEditForm();
            $scope.titulo = $scope.TituloAccionABMC.M;
            $scope.proyecto = angular.copy(proyecto);
        };

        $scope.ToggleAddEditForm = function () {
            $('#formEditJornada').collapse('toggle');
            $scope.mostrandoForm = !$scope.mostrandoForm;
        }

        $scope.ShowAddEditForm = function () {
            if (!$scope.mostrandoForm)
                $scope.ToggleAddEditForm();
        }

        $scope.limpiarProyecto = function () {
            $scope.proyecto = {
                nombre: "",
                activo: 1,
                id: 0
            }
        }

        $scope.existeProyecto = function (proyecto) {
            return $scope.Lista.find(item => item.Nombre === proyecto.Nombre) !== undefined;
        };

        $scope.CargarLista();
    }
);