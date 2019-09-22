using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using Datos;

namespace SesionesTrabajo.Controllers
{
    public class ProyectosController : ApiController
    {
        private pav2_72622Entities db = new pav2_72622Entities();

        // GET: api/Proyectos
        public IHttpActionResult GetProyectos(string Nombre = "", bool? Activo = null, int numeroPagina = 1)
        {
            int RegistrosTotal;
            //ref c#  var
            var Lista = Datos.Gestores.GestorProyectos.Buscar(Nombre, Activo, numeroPagina, out RegistrosTotal);
            return Ok(new { Lista = Lista, RegistrosTotal = RegistrosTotal });
        }

        // GET: api/Proyectos/5
        [ResponseType(typeof(Proyectos))]
        public IHttpActionResult GetProyectos(int id)
        {
            Proyectos proyectos = Datos.Gestores.GestorProyectos.BuscarPorId(id);
            if (proyectos == null)
            {
                return NotFound();
            }

            return Ok(proyectos);
        }

        // PUT: api/Proyectos/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutProyectos(int id, Proyectos proyectos)
        {
            if (!ModelState.IsValid)  //ref DataAnnotations; validar en el servidor ??
            {
                return BadRequest(ModelState);
            }

            if (id != proyectos.IdProyecto)
            {
                return BadRequest();
            }

            Datos.Gestores.GestorProyectos.Grabar(proyectos);

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST: api/Proyectos
        [ResponseType(typeof(Proyectos))]
        public IHttpActionResult PostProyectos(Proyectos proyectos)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Datos.Gestores.GestorProyectos.Grabar(proyectos);

            return CreatedAtRoute("DefaultApi", new { id = proyectos.IdProyecto }, proyectos);
        }

        // DELETE: api/Proyectos/5
        [ResponseType(typeof(Proyectos))]
        public IHttpActionResult DeleteProyectos(int id)
        {
            Datos.Gestores.GestorProyectos.ActivarDesactivar(id);
            return StatusCode(HttpStatusCode.NoContent);
        }
    }
}