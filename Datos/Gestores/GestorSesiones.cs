using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;

namespace Datos.Gestores
{
    public class GestorSesiones
    {
        public static IEnumerable<SesionTrabajo> Buscar(string Tareas,
            decimal PrecioHora,
            int IdProyecto,
            int CantTareas,
            string FechaDesde,
            string FechaHasta,
            bool? Activo,
            int numeroPagina, out int RegistrosTotal)
        {

            //ref Entity Framework

            using (pav2_72622Entities db = new pav2_72622Entities())     //el using asegura el db.dispose() que libera la conexion de la base
            {
                IQueryable<SesionTrabajo> consulta = db.SesionTrabajo;
                // aplicar filtros
                //ref LinQ
                //Expresiones lambda, metodos de extension

                if (!string.IsNullOrEmpty(Tareas))
                    consulta = consulta.Where(x => x.Tareas.ToUpper().Contains(Tareas.ToUpper()));    // equivale al like '%TextoBuscar%'
                if (PrecioHora != 0)
                    consulta = consulta.Where(x => x.PrecioHora == PrecioHora);
                if (IdProyecto != 0)
                    consulta = consulta.Where(x => x.IdProyecto == IdProyecto);
                if (CantTareas != 0)
                    consulta = consulta.Where(x => x.CantTareas == CantTareas);
                if (!string.IsNullOrEmpty(FechaDesde))
                {
                    DateTime fechaDesde = Convert.ToDateTime(FechaDesde);
                    consulta = consulta.Where(x => DbFunctions.TruncateTime(x.FechaDesde) == fechaDesde.Date);
                }

                if (!string.IsNullOrEmpty(FechaHasta))
                {
                    DateTime fechaHasta = Convert.ToDateTime(FechaHasta);
                    consulta = consulta.Where(x => DbFunctions.TruncateTime(x.FechaHasta) == fechaHasta.Date);
                }
                if (Activo != null)
                    consulta = consulta.Where(x => x.Activo == Activo);
                RegistrosTotal = consulta.Count();

                // ref EF; consultas paginadas
                int RegistroDesde = (numeroPagina - 1) * 10;
                var Lista = consulta.OrderBy(x => x.Tareas).Skip(RegistroDesde).Take(10).ToList(); // la instruccion sql recien se ejecuta cuando hacemos ToList()
                return Lista;
            }

        }



        public static SesionTrabajo BuscarPorId(int sId)
        {
            using (pav2_72622Entities db = new pav2_72622Entities())
            {
                return db.SesionTrabajo.Find(sId);
            }
        }

        public static void Grabar(SesionTrabajo DtoSel)
        {
            // validar campos
            string erroresValidacion = "";
            if (string.IsNullOrEmpty(DtoSel.Tareas))
                erroresValidacion += "Nombre es un dato requerido; ";
            if (!string.IsNullOrEmpty(erroresValidacion))
                throw new Exception(erroresValidacion);

            // grabar registro
            using (pav2_72622Entities db = new pav2_72622Entities())
            {
                try
                {
                    if (DtoSel.IdSesion != 0)
                    {
                        db.Entry(DtoSel).State = EntityState.Modified;
                        db.SaveChanges();
                    }
                    else
                    {
                        db.SesionTrabajo.Add(DtoSel);
                        db.SaveChanges();
                    }
                }
                catch (Exception ex)
                {
                    if (ex.ToString().Contains("UK_SesionTrabajo_Tareas"))
                        throw new ApplicationException("Ya existe otra Sesion con esas Tareas");
                    else
                        throw;
                }
            }
        }


        public static void ActivarDesactivar(int IdSesion)
        {
            using (pav2_72622Entities db = new pav2_72622Entities())
            {
                //ref Entity Framework; ejecutar codigo sql directo
                db.Database.ExecuteSqlCommand("Update SesionTrabajo set Activo = case when ISNULL(activo,1)=1 then 0 else 1 end  where IdSesion = @IdSesion",
                    new SqlParameter("@IdSesion", IdSesion)
                    );
            }
        }



        public static SesionTrabajo ADOBuscarPorId(int IdSesion)
        {
            //ref ADO; Recuperar cadena de conexión de web.config
            string CadenaConexion = System.Configuration.ConfigurationManager.ConnectionStrings["PymesAdo"].ConnectionString;
            //ref ADO; objetos conexion, comando, parameters y datareader
            SqlConnection cn = new SqlConnection();
            cn.ConnectionString = CadenaConexion;
            SesionTrabajo sesionTrabajo = null;
            try
            {
                cn.Open();
                SqlCommand cmd = new SqlCommand();
                cmd.Connection = cn;
                cmd.CommandText = "select * from SesionTrabajo c where c.IdSesion = @IdSesion";
                cmd.Parameters.Add(new SqlParameter("@IdSesion", IdSesion));
                SqlDataReader dr = cmd.ExecuteReader();
                // con el resultado cargar una entidad
                //ref ADO; generar un objeto entidad
                if (dr.Read())
                {
                    sesionTrabajo = new SesionTrabajo();
                    sesionTrabajo.IdSesion = (int)dr["IdSesion"];
                    sesionTrabajo.Tareas = dr["Tareas"].ToString();
                    if (dr["PrecioHora"] != DBNull.Value)
                        sesionTrabajo.PrecioHora = (decimal)dr["PrecioHora"];
                    if (dr["IdProyecto"] != DBNull.Value)
                        sesionTrabajo.IdProyecto = (int)dr["IdProyecto"];
                    if (dr["CantTareas"] != DBNull.Value)
                        sesionTrabajo.CantTareas = (int)dr["CantTareas"];
                    
                    if (dr["FechaDesde"] != DBNull.Value)
                        sesionTrabajo.FechaDesde = (DateTime)dr["FechaDesde"];
                    if (dr["FechaHasta"] != DBNull.Value)
                        sesionTrabajo.FechaHasta = (DateTime)dr["FechaHasta"];
                    if (dr["Activo"] != DBNull.Value)
                        sesionTrabajo.Activo = (bool)dr["Activo"];
                }
                dr.Close();
            }
            catch (Exception)
            {

                throw;
            }
            finally
            {
                if (cn.State == ConnectionState.Open)
                    cn.Close();
            }
            return sesionTrabajo;
        }
    }
}

