const listadoDeCursos = require('../dataBase/lista-de-cursos');
const fs= require('fs');
let listado = require('../dataBase/usuariosRegistrados.json');

function mostrarCursoInscritos (reqCurso, reqDatos) {
    reqCurso = [];
    let listadoIdCurso = reqDatos;
    listadoIdCurso.map( (value) => {
        listadoDeCursos.find( curso => {
            if(value == curso.id) {
                reqCurso.push(curso);
            }
        })
    });

    return reqCurso;
}

function eliminarCurso (idCurso, IdAspirante) {
    let listaCursos = [];
    listado.find( usuario => {
            if(usuario.identidad === IdAspirante){
                usuario.cursosRegistrados.filter( id => {
                    if(id != idCurso){
                        listaCursos.push(id);
                    }
                })
            }
    }) 
    
    listado.find( (usuario) => {
        if(usuario.identidad === IdAspirante) {
            usuario.cursosRegistrados = listaCursos;
            guardar(); 
        }   
    })
}

function inscribirseAunCurso (datoCurso, idEstudiante) {
    let cursoExiste = false;

    listado.find( (persona) => {
        if(persona.identidad === idEstudiante){
            persona.cursosRegistrados.find( (value) => {
                if(value === datoCurso){
                    cursoExiste = true;
                    return cursoExiste;
                }                
            }); 
            
        if(cursoExiste){
            console.log('Ya estás registrado');
        } else {          
            persona.cursosRegistrados.push(datoCurso);
            let curso = listadoDeCursos.find(registrado => registrado.id == datoCurso)
            curso.personasRegistradas.push(idEstudiante)
            guardar(); 
            registrarEnCurso();            
         }
        }
    })   
}

const guardar = () => {
    let datos = JSON.stringify(listado, null, 2);

    fs.writeFile('./dataBase/usuariosRegistrados.json', datos, (err) =>{
        if(err) throw err;
        console.log('Datos almacenados correctamente');
    })
}
const registrarEnCurso=()=>{
    let datosCur = JSON.stringify(listadoDeCursos, null, 2);
    fs.writeFile('./dataBase/lista-de-cursos.json',datosCur,(err)=>{
        if (err)throw err;
    })
}

module.exports = {
    mostrarCursoInscritos : mostrarCursoInscritos,
    inscribirseAunCurso : inscribirseAunCurso,
    eliminarCurso: eliminarCurso
}