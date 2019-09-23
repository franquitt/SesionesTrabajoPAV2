let myApp = angular.module('myApp', []);

myApp.controller('ProyectosCtrl',
	function ($scope, $http) {

		$scope.TituloAccionABMC = { A: '(Agregar)', B: '(Eliminar)', M: '(Modificar)', C: '(Consultar)', L: null };
		$scope.AccionABMC = 'L';   // inicialmente inicia el el listado (buscar con parametros)
		$scope.Mensajes = { SD: ' No se encontraron registros...', RD: ' Revisar los datos ingresados...' };


		$scope.DtoFiltro = {};    // dto con las opciones para buscar en grilla
		$scope.DtoFiltro.Activo = null;
		$scope.PaginaActual = 1;  // inicia pagina 1

		// opciones del filtro activo
		$scope.OpcionesSiNo = [{ Id: null, Nombre: '' }, { Id: true, Nombre: 'SI' }, { Id: false, Nombre: 'NO' }];

		// invoca metodo WebApi para cargar una lista de datos (familias de articulos) que se usa en un combo
		$http.get('/api/Proyectos').then(function (response) {
			$scope.Lista = response.data.Lista;
		});

		///**FUNCIONES**///
		$scope.Agregar = function () {
			$scope.AccionABMC = 'A';
			$scope.DtoSel = {};
			$scope.DtoSel.Activo = true;
		};

		$scope.ActivarDesactivar = function (proyecto) {
			var resp = confirm("Esta seguro de " + (proyecto.Activo ? "desactivar" : "activar") + " este proyecto?");
			if (resp){
				$http.delete('/api/Proyectos/'+proyecto.IdProyecto).then(function (response) {
					alert('Proyecto ' + proyecto.Nombre + " " + (proyecto.Activo ? "desactivado" : "activado"));
					proyecto.Activo = !proyecto.Activo;
				});
				
			}
		};

		//Buscar segun los filtros, establecidos en DtoFiltro
		$scope.Buscar = function () {
			alert('Buscando datos...');
		};
	}
);