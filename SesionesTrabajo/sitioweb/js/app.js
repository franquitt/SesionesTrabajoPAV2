let myApp = angular.module('myApp', []);
myApp.controller('ProyectosCtrl',
    function ($scope, $http) {

        const endpoint = "/api/Proyectos";
        $scope.proyecto = {
            Nombre: "",
            Activo: false,
            IdProyecto: 0
        };
        $scope.Lista = [];
        $scope.mostrandoForm = false;

        $scope.cteAccion = { A: 'Agregar Proyecto', B: 'Eliminar Proyecto', M: 'Modificar Proyecto', C: 'Consultar Proyecto', L: "Buscar Proyectos" };
        $scope.Mensajes = { SD: ' No se encontraron registros...', RD: ' Revisar los datos ingresados...' };
        $scope.accionActual = $scope.cteAccion.C;

        $scope.BusquedaFiltro = {
            Nombre: "",
            Activo: null,
            numeroPagina: 1
        };
        $scope.PaginaActual = 1;  // inicia pagina 1

        // opciones del filtro activo
        $scope.OpcionesSiNo = [{ Id: null, Nombre: '' }, { Id: true, Nombre: 'SI' }, { Id: false, Nombre: 'NO' }];

        $scope.CargarLista = function () {
            $http.get('/api/Proyectos', { params: $scope.BusquedaFiltro }).then(function (response) {
                $scope.Lista = response.data.Lista;
            });
        }

        ///**FUNCIONES**///

        

        $scope.Aplicar = function () {
            const callbackOk = function (response) {
                $scope.CargarLista();
                $scope.ToggleAddEditForm();
                $scope.limpiarProyecto();
                $scope.accionActual = $scope.cteAccion.C;
            };

            if ($scope.accionActual == $scope.cteAccion.L) {
                $scope.BusquedaFiltro = {
                    Nombre: $scope.proyecto.Nombre,
                    Activo: $scope.proyecto.Activo,
                    numeroPagina: 1
                };
                $scope.CargarLista();
                return;
            }

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
            $scope.accionActual = $scope.cteAccion.A;
            $scope.limpiarProyecto();
        };

        $scope.EditarBtn = function (proyecto) {
            $scope.ShowAddEditForm();
            $scope.accionActual = $scope.cteAccion.M;
            $scope.proyecto = angular.copy(proyecto);
        };

        $scope.BuscarBtn = function () {
            $scope.ShowAddEditForm();
            $scope.accionActual = $scope.cteAccion.L;
            $scope.limpiarProyecto();
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
                Nombre: "",
                Activo: 1,
                IdProyecto: 0
            };
        }

        $scope.existeProyecto = function (proyecto) {
            return $scope.Lista.find(item => item.Nombre === proyecto.Nombre) !== undefined;
        };

        $scope.CargarLista();
    }
);