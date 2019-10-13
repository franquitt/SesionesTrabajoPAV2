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

namespace SesionesTrabajo
{
    public class SesionTrabajoController : ApiController
    {
        private pav2_72622Entities db = new pav2_72622Entities();

        // GET: api/SesionTrabajo
        public IHttpActionResult GetSesionTrabajo(string Tareas = "",
            decimal PrecioHora = 0,
            int IdProyecto = 0,
            int CantTareas = 0,
            string FechaDesde = "",
            string FechaHasta = "",
            bool? Activo = null,            
            int numeroPagina = 1)
        {
            int RegistrosTotal;
            //ref c#  var
            var Lista = Datos.Gestores.GestorSesiones.Buscar(Tareas, PrecioHora, IdProyecto, CantTareas, FechaDesde, FechaHasta, Activo, numeroPagina, out RegistrosTotal);
            return Ok(new { Lista = Lista, RegistrosTotal = RegistrosTotal });
        }

        // GET: api/SesionTrabajo/5
        [ResponseType(typeof(SesionTrabajo))]
        public IHttpActionResult GetSesionTrabajo(int id)
        {
            SesionTrabajo sesionTrabajo = db.SesionTrabajo.Find(id);
            if (sesionTrabajo == null)
            {
                return NotFound();
            }

            return Ok(sesionTrabajo);
        }

        // PUT: api/SesionTrabajo/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutSesionTrabajo(int id, SesionTrabajo sesionTrabajo)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != sesionTrabajo.IdSesion)
            {
                return BadRequest();
            }

            db.Entry(sesionTrabajo).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                    throw;
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST: api/SesionTrabajo
        [ResponseType(typeof(SesionTrabajo))]
        public IHttpActionResult PostSesionTrabajo(SesionTrabajo sesionTrabajo)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.SesionTrabajo.Add(sesionTrabajo);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = sesionTrabajo.IdSesion }, sesionTrabajo);
        }

        // DELETE: api/SesionTrabajo/5
        [ResponseType(typeof(SesionTrabajo))]
        public IHttpActionResult DeleteSesionTrabajo(int id)
        {
            Datos.Gestores.GestorSesiones.ActivarDesactivar(id);
            return StatusCode(HttpStatusCode.NoContent);
        }
    }
}