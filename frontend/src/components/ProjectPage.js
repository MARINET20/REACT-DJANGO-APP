import React, { useEffect, useState } from 'react';
import AuthContext from './AuthContext';
import { API_URL } from '..';
import {useParams} from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';


const ProjectPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [is_user, setIsUser] = useState(null);


  
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`${API_URL}/project/${id}`);
        const data = await response.json();
        setProject(data);
      } catch (error) {
        console.error(error);
      }
    };
    const fetchUserData = async () => {
      const authTokens = JSON.parse(localStorage.getItem('authTokens'));
      if (authTokens) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${authTokens.access}`;
        const decodedUser = jwtDecode(authTokens.access);
        try {
          const userResponse = await axios.get(`${API_URL}/user/${decodedUser.user_id}`);
          setIsUser(userResponse.data);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };
    fetchProject();
    fetchUserData();
  }, [id]);


  if (!project) {
    return <div></div>;
  }

  return (
    <AuthContext.Consumer>
       {({ user }) => (
        <div>
          <div className='container'>
            <div className='pt-30' style={{color: '#00AEEF'}} >
                <h1>{project.title}</h1>
            </div>
          </div>
          <div className='container mt-3'>
            <div className='section news-detail mt-0'>
                <div className='left'>
                  <div className='flex flex-wrap-wrap align-items-center'>
                    <div className="tag-container">
                      {project.tags.map((tag, index) => (
                        <p className="fs-16 lh-24 color-blue m-0" style={{padding: '3px'}} key={index}>{tag.tag}</p>
                      ))}
                    </div>
                  </div>
                  <img src='https://otkrytky.ru/o/img/0336/otrkytky-ru-109-cGluaW1nLmNvbQ.png' alt='' className='mt-3'></img>
                  <p className='border-top'></p>
                  <p className='color-deep-grey'>Описание проекта</p>
                  <div className='text-prew pt-24'>
                    {project.description}
                  </div>
                  <p className='border-top'></p>
                  <p className='color-deep-grey'>Требование к участникам</p>
                  <div>
                    {project.skills.sort((a, b) => b.weight_skill - a.weight_skill).map((req, index) => (
                          <div key={index} style={{marginBottom: '10px', fontWeight:'600'}}>
                              {req.skill} :
                              <span>
                              {[...Array(10)].map((_, index) => (
                                  <svg key={index} xmlns="http://www.w3.org/2000/svg" width="15" height="15" style={{fill: index < Math.round(req.weight_skill * 10) ? '#f0c313' : '#b9b9b9', margin: '3px 1px', cursor: 'pointer', marginLeft: '10px'}}>
                                      <path d="M7.5 0l2.3 4.6h4.7l-3.4 3.3 1.2 6.6-6-3.4-6 3.4 1.3-6.6-3.4-3.3h4.6z"/>
                                  </svg>
                              ))}
                              </span>
                          </div>
                      ))}
                  </div>
                </div>
                <div className='right right-block-bg-white'>
                  <div>
                    <div className=' flex mb-24 fl-column pt-24 pb-24' style={{alignItems: "flex-start"}}>
                      <div className='bg-ligth-grey pr-16 pl-16 br-50 pt-8 pb-8'>
                        Участников в команде{' '}
                        <span className='color-blue fw-700 'style={{ paddingRight: '10px' }}>{project.students.length}</span>  
                        {/* <span className='color-blue fw-700 'style={{ paddingRight: '10px' }}>{this.state.count}</span>   */}
                      </div>
                    </div>
                  </div>
                  <div className='hidden-block'></div>
                  <div className="flex mb-24 fl-column">
                    <div className='flex fl-column align-items-start'>
                      {project.teachers.map((teacher, index) => (
                        <div className='d-flex justify-content-between'>
                          <img src='https://rsv.ru/account/img/placeHolder-m.4c1254a5.png' alt='' className='prew-user-photo'></img>
                          <div>
                            <h5 className='fw-700 sf-20 lh-30 mt-2' key={index}>{teacher.name}</h5>
                            <p style={{color:'#ffff', background:'#00abed', padding: '7px 10px', borderRadius: '50px', marginLeft:'5px', alignItems: 'center', display: 'inline-flex'}}>Куратор</p>
                          </div>
                        </div>
                      ))}
                      <h5 className="color-gray"> Команда проекта</h5>
                      {project.students.map((student) => (
                        <div className='d-flex justify-content-between'>
                          <img src='https://rsv.ru/account/img/placeHolder-m.4c1254a5.png' alt='' className='prew-user-photo'></img>
                          <div style={{width: '200px'}}>
                            <h5 className="fs-20 lh-24 color-blue mt-3">{student.name}</h5>
                            <p className="fs-20 lh-24 mt-3" style={{color:'#212529'}}>{student.direction}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {!project.status && user  && is_user && !is_user.is_student ? ( <a 
                      href={`/team/${project.id}`}
                      className='btn btn-sm mt-3'
                      style={{background: '#212529', color:'white', marginLeft:'10px'}}
                    >Сформировать команду</a> 
                    ) : (
                      null
                    )}
                  </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Consumer>
  );
};

export default ProjectPage