import React, { Component } from 'react'
import AuthContext from './AuthContext'
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { API_URL, URL } from '..';
import {
  useNavigate
} from "react-router-dom";

export class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      is_user: null,
      is_staff: null,
      is_student: null,
      user_info: null,
      logoutUser: null,
      removeItem: null,
      userId: null,
      isProject: true,
      isSkill: false,
      isProjectCompleted: null,
      formData: {
        project_id: null,
        user_id: null
      },
      avatarUrl: 'https://rsv.ru/account/img/placeHolder-m.4c1254a5.png',
    };
    this.handleAvatarChange = this.handleAvatarChange.bind(this);
  }

  handleAvatarChange(e) {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('photo', file);

    axios.post(`${API_URL}/upload-avatar`, formData)
      .then((response) => {
        const newAvatarUrl = response.data.avatarUrl;
        this.setState({ avatarUrl: newAvatarUrl });
      })
      .catch((error) => {
        console.error('Ошибка в загрузке аватара', error);
        alert('Ошибка в загрузке аватара');
      });
  }

  handleSkillClick() {
    this.setState({
      isProject: false,
      isSkill: true,
    });
  }

  handleProjectClick() {
    this.setState({
      isProject: true,
      isSkill: false
    });
  }

  handleChange = (e) => {
    const value = e.target.value === 'true' ? true : false;
    this.setState({ isProjectCompleted: value });
  }

  componentDidMount() {
    this.updateUserData();
  }

  updateUserData = async () => {
    const authTokens = JSON.parse(localStorage.getItem('authTokens'));
    if (authTokens) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${authTokens.access}`;
      const decodedUser = jwtDecode(authTokens.access);
      try {
        let userResponse = await axios.get(`${API_URL}/user/${decodedUser.user_id}`)
        this.setState({ is_user: userResponse.data, is_staff: userResponse.data.is_staff, is_student: userResponse.data.is_student, user_info: userResponse.data.user_info, avatarUrl: userResponse.data.user_info.photo});
      } catch (error) {
        console.error('Ошибка при получении пользовательских данных:', error);
      }

    } else {
      const history = useNavigate;
      history('/login');
    }
  }


  handleApplication = async (user_id, project_id) => {
    const { formData } = this.state;
    formData.project_id = project_id;
    formData.user_id = user_id;

    this.setState({ formData });

    try {
      const response = await fetch(`${API_URL}/delete-applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.state.formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.message);
      } else {
        const data = await response.json();
        console.log(data.error);
      }
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    const { is_user, is_staff, is_student } = this.state;
    if (!is_user) {
      <div></div>
    }

    // let imageUrl = ''; // заменим const на let, так как значение будет изменяться

    // if (is_user?.user_info.name.endsWith('а')) {
    //   imageUrl = 'https://i.pinimg.com/736x/87/ff/14/87ff14780b70043d7a2e2d21fcdb26c1.jpg'
    // } else {
    //   imageUrl = this.state.avatarUrl ? `${URL}${this.state.avatarUrl}` : 'https://rsv.ru/account/img/placeHolder-m.4c1254a5.png'; // исправляем строку с imageUrl
    // }
    const imageUrl = this.state.avatarUrl ? `${URL}${this.state.avatarUrl}` : 'https://rsv.ru/account/img/placeHolder-m.4c1254a5.png';
    return (
        <AuthContext.Consumer>
        {({ user, logoutUser }) => (
          <div className="container">
              {user && (
              <div>
                <div className='d-flex justify-content-between '>
                  <div className='pt-30 '>
                    <h1 className=" m-0" style={{color: '#00AEEF'}}>
                      {is_student ? 'Личный кабинет студента ' : 'Личный кабинет преподавателя'}
                    </h1>  
                  </div>
                  <div className='logout-line mt-4' onClick={logoutUser} style={{cursor:'pointer'}}>
                    <div className='logout-container'>
                      <img width="15px" height="15px" src="https://img.icons8.com/ios/50/ef627d/exit--v1.png" alt="exit--v1"/>
                      <span className='logout-text'>Выйти из профиля</span>
                    </div>
                  </div>
                </div>
                {!is_staff ? (
                  <div>
                    <div className=" mt-3 d-flex" style={{width: '100%'}}>
                      <div className='padding-left-null padding-top-null'>
                        <div className="profile profile-wrapper">
                        <div className="profile__content">
                          <div className="profile__content--left">
                            <input type="file" accept="image/*" onChange={this.handleAvatarChange} hidden />
                            <div className="profile__avatar" style={{ backgroundImage: `url(${imageUrl})`, cursor:'pointer' }} onClick={() => document.querySelector('input[type="file"]').click()}>
                            </div>
                          </div>
                          <div className="profile__content--right">
                            {/* <div  className="profile__user-id" style={{color:'#00abed'}}>{is_user?.email}</div> */}
                              <div  className="profile__title">{ is_user?.user_info.name}</div>
                              {is_student ? (
                                <div>
                                  <div  className="profile__text">{ is_user?.user_info.course} курс</div>
                                  <div  className="profile__text" >{ is_user?.user_info.direction}</div>
                                </div>
                              ) : ( 
                              <div>
                                <div  className="profile__text">Преподаватель</div>
                                <div  className="profile__text" >Кафедра программного обеспечения</div>
                              </div> )}
                            </div>
                          </div>
                        </div>
                        <div className="grid margin-achievements">
                        { is_student ? (
                          <div >
                            <div  className="shadow" style={{ padding: '1.0375rem 1.66rem', height: '4.66875rem', borderRadius: '.51875rem', cursor:'pointer'}}>
                              <div  onClick={() => this.handleSkillClick()} href="#" style={{color:'#4e4d4d', textDecoration: 'none', fontWeight:'600', fontSize: '.83rem'}}  aria-current="page">
                                <img width="35" height="35" src="https://img.icons8.com/ios/50/4e4d4d/love-circled.png" alt="Отобранные проекты"/>
                                Избранные проекты
                              </div>
                            </div>
                          </div>
                        ) : null }
                        <div>
                          <div className="shadow" style={{ padding: '1.0375rem 1.66rem', height: '4.66875rem', borderRadius: '.51875rem', cursor:'pointer'}}>
                            <div  onClick={() => this.handleProjectClick()}  style={{color:'#4e4d4d', textDecoration: 'none', fontWeight:'600', fontSize: '.83rem'}} >
                              <img width="40" height="40" src="https://img.icons8.com/ios-glyphs/30/4e4d4d/untested.png" alt="Персональные проекты"/>
                                Ваши проекты
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  <div style={{width: '70%', marginLeft:'20px'}}>
                    {this.state.isProject ? (
                    <div className=' profile profile-wrapper'>
                      <div className='profile__content justify-content-between'>
                        <h3 className="profile__title">Ваши&nbsp;проекты</h3>
                        <div style={{ fontSize: '.93375rem', lineHeight: '1.14125rem'}}>
                          <div>
                            <input type="radio" id="false" name="drone" value="false" onChange={this.handleChange}/>
                            <label htmlFor="false" style={{marginLeft:"5px"}}>Текущие</label>
                            <span> | </span>
                            <input type="radio" id="true" name="drone" value="true" onChange={this.handleChange}/>                            
                            <label htmlFor="true" style={{marginLeft:"5px"}}>Завершенные</label>
                          </div>
                        </div>
                      </div>
                      {is_user?.projects ? ( 
                        <div className="">
                          <div>
                            Количество проектов: {is_user?.projects.filter(project => project.status === this.state.isProjectCompleted).length}
                          </div> 
                          {is_user?.projects
                            .filter(project => project.status === this.state.isProjectCompleted) 
                            .map((project, index) =>
                            <div className="flex justify-content-center">
                            <a href={`/project/${project.id}`} key={index} className='flex tabs-card__body-card one-card card_up' style={{cursor: 'pointer', textDecoration:'none'}}>
                              <div className='tabs-card__body-card-top-img'>
                                <img src="https://otkrytky.ru/o/img/0336/otrkytky-ru-109-cGluaW1nLmNvbQ.png" alt="картинка проекта" 
                                style={{maxWidth: '100%',fontStyle: 'italic', verticalAlign: 'middle'}}/>
                              </div>
                              <div className=''>
                                  <h4  className="tabs-card__body-card-top-info-title">{project.title}</h4>
                              </div>
                            </a>
                            </div>
                          )}
                          {is_user?.projects.filter(project => project.status === this.state.isProjectCompleted).length === 0 && (
                            <div className="flex justify-content-center">
                              <div className='flex'>
                                <img width="60" height="60" src="https://img.icons8.com/pulsar-line/96/4e4d4d/oops.png" alt="oops"/>  
                                <div>
                                  <div style={{color:'#9fb7e3'}}>Oops!</div>
                                  <div style={{color:'#9fb7e3'}}>У вас пока нет проектов</div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                        </div>
                      ) : ( 
                        <div className="flex justify-content-center">
                          <div className='flex'>
                            <img width="60" height="60" src="https://img.icons8.com/pulsar-line/96/4e4d4d/oops.png" alt="oops"/>  
                            <div>
                              <div style={{color:'#9fb7e3'}}>Oops!</div>
                              <div style={{color:'#9fb7e3'}}>У вас пока нет проектов</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className=' profile profile-wrapper'>
                      <div className='profile__content'>
                        <h3 className="profile__title">Избранные проекты</h3>
                      </div>
                      <div>
                        Количество проектов: {is_user?.selected_projects.filter(project => project.status === false).length}
                      </div>
                      {is_user?.selected_projects.filter(project => project.status === false).length > 0 && 
                        is_user?.selected_projects.map((project, index) => (
                          <div>
                            <div className="d-flex justify-content-between" key={index}>
                              <a href={`/project/${project.id}`}  className='flex tabs-card__body-card one-card card_up' style={{cursor: 'pointer', textDecoration:'none'}}>
                                <div className='tabs-card__body-card-top-img'>
                                  <img src="https://otkrytky.ru/o/img/0336/otrkytky-ru-109-cGluaW1nLmNvbQ.png" alt="картинка проекта" 
                                  style={{maxWidth: '100%',fontStyle: 'italic', verticalAlign: 'middle'}}/>
                                </div>
                                <div className=''>
                                    <h4  className="tabs-card__body-card-top-info-title">{project.title}</h4>
                                </div>
                                <div style={{marginLeft:'200px'}}  onClick={() => this.handleApplication(user.user_id, project.id)}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0,0,300,150"
                                    style={{fill:"#ef627d"}}>
                                    <g fill="#ef627d" fillRule="nonzero" stroke="none" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" strokeDasharray="" strokeDashoffset="0" fontFamily="none" fontWeight="none" fontSize="none" textAnchor="none" style={{mixBlendMode: "normal"}}>
                                      <g transform="scale(10.66667,10.66667)">
                                        <path d="M4.99023,3.99023c-0.40692,0.00011 -0.77321,0.24676 -0.92633,0.62377c-0.15312,0.37701 -0.06255,0.80921 0.22907,1.09303l6.29297,6.29297l-6.29297,6.29297c-0.26124,0.25082 -0.36647,0.62327 -0.27511,0.97371c0.09136,0.35044 0.36503,0.62411 0.71547,0.71547c0.35044,0.09136 0.72289,-0.01388 0.97371,-0.27511l6.29297,-6.29297l6.29297,6.29297c0.25082,0.26124 0.62327,0.36648 0.97371,0.27512c0.35044,-0.09136 0.62411,-0.36503 0.71547,-0.71547c0.09136,-0.35044 -0.01388,-0.72289 -0.27512,-0.97371l-6.29297,-6.29297l6.29297,-6.29297c0.29576,-0.28749 0.38469,-0.72707 0.22393,-1.10691c-0.16075,-0.37985 -0.53821,-0.62204 -0.9505,-0.60988c-0.2598,0.00774 -0.50638,0.11632 -0.6875,0.30273l-6.29297,6.29297l-6.29297,-6.29297c-0.18827,-0.19353 -0.4468,-0.30272 -0.7168,-0.30273z">
                                        </path>
                                      </g>
                                    </g>
                                  </svg>
                                </div>
                              </a>
                            </div>
                          </div>
                        ))} 
                        {(!is_user || is_user.selected_projects.filter(project => project.status === false).length === 0) && (
                          <div className="flex justify-content-center">
                            <div className='flex'>
                              <img width="60" height="60" src="https://img.icons8.com/pulsar-line/96/4e4d4d/oops.png" alt="oops"/>  
                              <div>
                                <div style={{color:'#9fb7e3'}}>Oops!</div>
                                <div style={{color:'#9fb7e3'}}>У вас пока нет избранных проектов</div>
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </div>
                </div>
                </div>
              ): null}
              </div>
              )}
          </div>
        )}
      </AuthContext.Consumer>
    )
  }
}

export default Profile