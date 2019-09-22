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
    public class GestorProyectos
    {
        public static IEnumerable<Proyectos> Buscar(string Nombre, bool? Activo, int numeroPagina, out int RegistrosTotal)
        {

            //ref Entity Framework

            using (pav2_72622Entities db = new pav2_72622Entities())     //el using asegura el db.dispose() que libera la conexion de la base
            {
                IQueryable<Proyectos> consulta = db.Proyectos;
                // aplicar filtros
                //ref LinQ
                //Expresiones lambda, metodos de extension
                if (!string.IsNullOrEmpty(Nombre))
                    consulta = consulta.Where(x => x.Nombre.ToUpper().Contains(Nombre.ToUpper()));    // equivale al like '%TextoBuscar%'
                if (Activo != null)
                    consulta = consulta.Where(x => x.Activo == Activo);
                RegistrosTotal = consulta.Count();

                // ref EF; consultas paginadas
                int RegistroDesde = (numeroPagina - 1) * 10;
                var Lista = consulta.OrderBy(x => x.Nombre).Skip(RegistroDesde).Take(10).ToList(); // la instruccion sql recien se ejecuta cuando hacemos ToList()
                return Lista;
            }

        }



        public static Proyectos BuscarPorId(int sId)
        {
            using (pav2_72622Entities db = new pav2_72622Entities())
            {
                return db.Proyectos.Find(sId);
            }
        }

        public static void Grabar(Proyectos DtoSel)
        {
            // validar campos
            string erroresValidacion = "";
            if (string.IsNullOrEmpty(DtoSel.Nombre))
                erroresValidacion += "Nombre es un dato requerido; ";
            if (!string.IsNullOrEmpty(erroresValidacion))
                throw new Exception(erroresValidacion);

            // grabar registro
            using (pav2_72622Entities db = new pav2_72622Entities())
            {
                try
                {
                    if (DtoSel.IdProyecto != 0)
                    {
                        db.Entry(DtoSel).State = EntityState.Modified;
                        db.SaveChanges();
                    }
                    else
                    {
                        db.Proyectos.Add(DtoSel);
                        db.SaveChanges();
                    }
                }
                catch (Exception ex)
                {
                    if (ex.ToString().Contains("UK_Proyectos_Nombre"))
                        throw new ApplicationException("Ya existe otro Proyecto con ese Nombre");
                    else
                        throw;
                }
            }
        }


        public static void ActivarDesactivar(int IdProyecto)
        {
            using (pav2_72622Entities db = new pav2_72622Entities())
            {
                //ref Entity Framework; ejecutar codigo sql directo
                db.Database.ExecuteSqlCommand("Update Proyectos set Activo = case when ISNULL(activo,1)=1 then 0 else 1 end  where IdProyecto = @IdProyecto",
                    new SqlParameter("@IdProyecto", IdProyecto)
                    );
            }
        }



        public static Proyectos ADOBuscarPorId(int IdProyecto)
        {
            //ref ADO; Recuperar cadena de conexión de web.config
            string CadenaConexion = System.Configuration.ConfigurationManager.ConnectionStrings["PymesAdo"].ConnectionString;
            //ref ADO; objetos conexion, comando, parameters y datareader
            SqlConnection cn = new SqlConnection();
            cn.ConnectionString = CadenaConexion;
            Proyectos proyecto = null;
            try
            {
                cn.Open();
                SqlCommand cmd = new SqlCommand();
                cmd.Connection = cn;
                cmd.CommandText = "select * from Proyectos c where c.IdProyecto = @IdProyecto";
                cmd.Parameters.Add(new SqlParameter("@IdProyecto", IdProyecto));
                SqlDataReader dr = cmd.ExecuteReader();
                // con el resultado cargar una entidad
                //ref ADO; generar un objeto entidad
                if (dr.Read())
                {
                    proyecto = new Proyectos();
                    proyecto.IdProyecto = (int)dr["IdProyecto"];
                    proyecto.Nombre = dr["nombre"].ToString();
                    if (dr["Activo"] != DBNull.Value)
                        proyecto.Activo = (bool)dr["Activo"];
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
            return proyecto;
        }
    }
}

