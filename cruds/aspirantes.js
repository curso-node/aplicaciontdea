// const listadoDeCursos = require('../dataBase/lista-de-cursos');
const fs= require('fs');
// let listado = require('../dataBase/usuariosRegistrados.json');

let respuesta = undefined;

//Models
const usuariosModel = require('../Models/usuarios')
const cursosModel = require('../Models/cursos')

function mostrarCursoInscritos (persona) {
    reqCurso = [];
    usuariosModel.findOne({identidad:persona},(err,resp)=>{
        if (err) {
            throw (err)
        }else{
            respuesta = resp
            listadoIdCurso = respuesta.cursosRegistrados
            listadoIdCurso.map( (value) => {
            cursosModel.findOne({_id:value},(err,resp)=>{
                if (err) {
                    throw err
                }else{
                    reqCurso.push(resp)
                }
            })
        });
        }
    })
    return reqCurso;
}

const eliminarCurso=(cur,usu)=>{
    usuariosModel.findOne({identidad:usu},(err,resp)=>{
        if (err) {
            throw (err)
        }else{
            dataUs = resp.cursosRegistrados
            cursosModel.findOne({_id:cur},(err,resp)=>{
                if (err) {
                    throw (err)
                }else{
                    dataCur = resp.personasRegistradas
                }

                if (!dataUs ) {
                    console.log("Uno de los datos es invalido. ¡verifique!")
                }else{
                    let personasNoEliminadas= []
                    for (var i = 0; i < dataCur.length; i++) {
                        if(dataCur[i]!=usu){
                            personasNoEliminadas.push(dataCur[i])   
                        }
                    }
                    cursosModel.updateOne({_id:cur},{$set:{personasRegistradas:personasNoEliminadas}},(err,respuesta)=>{})  
                        
                    cursosNoEliminados = []
                    for (var i = 0; i < dataUs.length; i++) {
                        if(dataUs[i]!=cur){
                            cursosNoEliminados.push(dataUs[i])      
                        }
                    }
                    usuariosModel.updateOne({identidad:usu},{$set:{cursosRegistrados:cursosNoEliminados}},(err,respuesta)=>{})
                }
            })
            
        }
    })
    respuesta = {
        estado: 'success',
        mensaje: 'Has cancelado el registro al curso',
        nombre: 'eliminarCurso',
    } 

    return respuesta;
}

function inscribirseAunCurso (datoCurso, idEstudiante) 
{
    let cursoExiste = false;
    usuariosModel.findOne({identidad:idEstudiante},(err,respUS)=>
    {
        if (err) {
            throw (err)
        }else
        {   resp = respUS
            cursosRegistrados = resp.cursosRegistrados            
            cursosRegistrados.find( (value) => {
                if(value == datoCurso){
                    cursoExiste = true;
                    return cursoExiste;
                }                
            }); 
            if(cursoExiste){
                respuesta = {
                    estado: 'danger',
                    mensaje: 'Ya estás registado al curso',
                    nombre: 'registroMalo',
                }
            } else
            {
                usuariosModel.updateOne({identidad:idEstudiante},{$push:{cursosRegistrados:datoCurso}},(err,res)=>{
                    if (err) {
                        throw (err)
                    }else{
                       return console.log(res) 
                    }
                })
                cursosModel.updateOne({_id:datoCurso},{$push:{personasRegistradas:idEstudiante}},(err,res)=>{
                    if (err) {
                        throw (err)
                    }else{
                       return console.log(res) 
                    }
                })
                respuesta = {
                    estado: 'success',
                    mensaje: 'Te has registado al curso',
                    nombre: 'registroBueno',
                }
            } 
        }
    
    })
    return respuesta;        
}
module.exports = {
    mostrarCursoInscritos : mostrarCursoInscritos,
    inscribirseAunCurso : inscribirseAunCurso,
    eliminarCurso: eliminarCurso
}