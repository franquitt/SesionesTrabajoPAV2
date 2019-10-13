let myApp = angular.module('myApp', []);
myApp.controller('JornadasCtrl',
    function ($scope, $http) {

        const endpoint = "/api/SesionTrabajo";

        $scope.Lista = [];
        $scope.proyectos = [];
        $scope.mostrandoForm = false;

        $scope.cteAccion = { A: 'Agregar Jornada', B: 'Eliminar Jornada', M: 'Modificar Jornada', C: 'Consultar Jornada', L: "Buscar Jornadas" };
        $scope.Mensajes = { SD: ' No se encontraron registros...', RD: ' Revisar los datos ingresados...' };
        $scope.accionActual = $scope.cteAccion.C;

        $scope.BusquedaFiltro = {
            Tareas: "",
            Activo: true,
            numeroPagina: 1
        };
        $scope.PaginaActual = 1;  // inicia pagina 1

        // opciones del filtro activo
        $scope.OpcionesSiNo = [{ Id: null, Nombre: '' }, { Id: true, Nombre: 'SI' }, { Id: false, Nombre: 'NO' }];

        $scope.CargarLista = function () {
            $http.get(endpoint, { params: $scope.BusquedaFiltro }).then(function (response) {
                $scope.Lista = response.data.Lista;
                $scope.convertirFechas();
                if (!$scope.proyectos.length) {
                    let busquedaProyecto = {
                        Nombre: "",
                        Activo: null,
                        numeroPagina: 1
                    };                    
                    $scope.getAllProjects(busquedaProyecto);
                }
                
            });
        }

        $scope.convertirFechas = function () {
            $scope.Lista = $scope.Lista.map(function (jornada) {
                jornada.FechaDesde = new Date(jornada.FechaDesde.split("T")[0]);
                jornada.FechaHasta = new Date(jornada.FechaHasta.split("T")[0]);
                return jornada;
            });
        }

        $scope.getAllProjects = function (parametros) {
            $http.get("/api/Proyectos", { params: parametros }).then(function (responseProyecto) {
                $scope.proyectos = $scope.proyectos.concat(responseProyecto.data.Lista);
                if ($scope.proyectos.length != responseProyecto.data.RegistrosTotal) {
                    parametros.numeroPagina += 1;
                    $scope.getAllProjects(parametros);
                } else {
                    $('.select2').select2({});
                }
            });
        };

        $scope.getProyecto = function (sesion) {
            return $scope.proyectos.find(proyecto => proyecto.IdProyecto == sesion.IdProyecto);
        };

        ///**FUNCIONES**///



        $scope.Aplicar = function () {
            const callbackOk = function (response) {
                $scope.CargarLista();
                $scope.ToggleAddEditForm();
                $scope.limpiarJornada();
                $scope.accionActual = $scope.cteAccion.C;
            };
            $scope.jornada.IdProyecto = $('#jornadaProyecto').val();

            if ($scope.accionActual == $scope.cteAccion.L) {
                $scope.BusquedaFiltro = {
                    Nombre: $scope.proyecto.Nombre,
                    Activo: $scope.proyecto.Activo,
                    numeroPagina: 1
                };
                $scope.CargarLista();
                return;
            }

            if ($scope.jornada.Tareas == "" ||
                ($scope.existeSesion($scope.jornada) && $scope.jornada.IdSesion == 0)) {
                alert("La tarea de la sesion no puede ser ya existente o estar vacía");
                return;
            }

            if ($scope.jornada.IdSesion == 0)
                $http.post(endpoint, $scope.jornada).then(callbackOk);
            else
                $http.put(endpoint + "/" + $scope.jornada.IdSesion, $scope.jornada).then(callbackOk);
        };

        $scope.ActivarDesactivar = function (jornada) {
            var resp = confirm("Esta seguro de " + (jornada.Activo ? "desactivar" : "activar") + " esta jornada?");
            if (resp) {
                $http.delete(endpoint + "/" + jornada.IdSesion).then(function (response) {
                    //alert('Proyecto ' + proyecto.Nombre + " " + (proyecto.Activo ? "desactivado" : "activado"));
                    jornada.Activo = !jornada.Activo;
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
            $scope.limpiarJornada();
        };

        $scope.EditarBtn = function (jornada) {
            $scope.ShowAddEditForm();
            $scope.accionActual = $scope.cteAccion.M;
            $scope.jornada = angular.copy(jornada);
            $('#jornadaProyecto').val($scope.jornada.IdProyecto).trigger('change');
        };

        $scope.BuscarBtn = function () {
            $scope.ShowAddEditForm();
            $scope.accionActual = $scope.cteAccion.L;
            $scope.limpiarJornada();
        };

        $scope.ToggleAddEditForm = function () {
            $('#formEditJornada').collapse(
                'toggle');
            $scope.mostrandoForm = !$scope.mostrandoForm;
        }

        $scope.ShowAddEditForm = function () {
            if (!$scope.mostrandoForm)
                $scope.ToggleAddEditForm();
        }

        $scope.limpiarJornada = function () {
            $scope.jornada = {
                IdSesion: 0,
                Tareas: "",
                PrecioHora: 0.0,
                IdProyecto: 0,
                CantTareas: 0,
                FechaDesde: "",
                FechaHasta: "",
                Activo: false,
            };
        }

        $scope.existeSesion = function (jornada) {
            return $scope.Lista.find(item => item.Tareas === jornada.Tareas) !== undefined;
        };
        $scope.showNiceDate = function (date) {
            var d = new Date(date);
            return [
                d.getFullYear(),
                ('0' + (d.getMonth() + 1)).slice(-2),
                ('0' + d.getDate()).slice(-2)
            ].join('-');
        };
        $scope.limpiarJornada();
        $scope.CargarLista();
    }
);
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
            Activo: true,
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
                Activo: false,
                IdProyecto: 0
            };
        }

        $scope.existeProyecto = function (proyecto) {
            return $scope.Lista.find(item => item.Nombre === proyecto.Nombre) !== undefined;
        };

        $scope.CargarLista();
    }
);