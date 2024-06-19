import React, { Component } from 'react';
import {
    Link,
    useNavigate
} from "react-router-dom";
import SearchBar from './SearchBar';
import AuthContext from './AuthContext';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { API_URL } from '..';



export class HomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            projects: [], // десь хранятся все проекты
            count: [],
            selectedProjects: [], // массив для хранения выбранных проектов
            currentPage: 1,
            itemsPerPage: 6, // количество элементов на одной странице
            pageCount: 0, // общее количество страниц
            filteredProjects: [], // здесь будут храниться отфильтрованные проекты
            searchQuery: '', // здесь будет храниться запрос пользователя
            projectsData: [],
            imageUrl: '', // Здесь будет сохранена ссылка на изображение
            applicationSubmitted: false, // Состояние для отслеживания отправки заявки
            formData: {
                project_id: null,
                user_id: null
            },
            is_user: null,

            selectedCount:null,
            selectedStatus:null,
            selectedTeacher:null,
            projects_for_filtetrs:[],
            isBlockVisible:false
        };
        this.setState = this.setState.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.toggleColor = this.toggleColor.bind(this);
    }

    

    handleProjectClick = (e, id) => {
        e.preventDefault();
        const { history } = useNavigate;
        history(`/project/${id}`);
    }


    async componentDidMount() {
        this.loadData();
    }

    loadData = async () => {
        try {
            const response = await fetch(`${API_URL}/`);
            const data = await response.json();
            this.setState({ projects: data, count: data.count });
    
            this.loadStudentsData();
            this.isCountProject();

            const authTokens = JSON.parse(localStorage.getItem('authTokens'));
            if (authTokens) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${authTokens.access}`;
                const decodedUser = jwtDecode(authTokens.access);
                this.fetchUserData(decodedUser.user_id);
            }
        } catch (error) {
            console.error('Ошибка при загрузке данных:', error);
        }
    };

    fetchUserData = async (user_id) => {
        try {
            const userResponse = await axios.get(`${API_URL}/user/${user_id}`);
            this.setState({ is_user: userResponse.data });
        } catch (error) {
          console.error('Ошибка при получении пользовательских данных:', error);
        }
    };

    isCountProject = async () => {
        try {
            const [res1, res2] = await Promise.all([
                fetch(`${API_URL}/get_count_from_db`),
                fetch(`${API_URL}/teachers`),
            ]);
            
            const [data1, data2] = await Promise.all([res1.json(), res2.json()]);
                        
            if (Array.isArray(data1) && data1.length > 0) {
                const is_count_project = data1.map(item => item.count);
                this.setState({ is_count_project});
            } else {
                console.error('Нет данных');
            }
            if (Array.isArray(data2) && data2.length > 0) {
                const is_teacher_project = data2.map(item => ({
                    id: item.id,
                    name: item.name,
                }));
                this.setState({ is_teacher_project});
            } else {
                console.error('Нет данных');
            }

        } catch (error) {
        console.error(error);
        }

        try {
            const response = await fetch(`${API_URL}/get_count_from_db`);
            if (!response.ok) {
                throw new Error('Не удалось получить данные о кол-ве участников в проекте');
            }
            const data = await response.json();
    
            if (Array.isArray(data) && data.length > 0) {
                const is_count_project = data.map(item => item.count);
                this.setState({ is_count_project});
            } else {
                console.error('Нет данных');
            }
        } catch (error) {
            console.error('Ошибка:', error);
        }
    }

    loadStudentsData = async () => {
        try {
            const response = await fetch(`${API_URL}/filter/project/team`);
            if (!response.ok) {
                throw new Error('Не удалось получить данные о завершенных проектах');
            }
            const data = await response.json();
    
            if (Array.isArray(data) && data.length > 0) {
                const projectsData = data.map(project => ({
                    id: project.id,
                    title: project.title,
                    count: project.count,
                    tags: project.tags,
                    teachers: project.teachers
                }));
                this.setState({ projectsData });
            } else {
                console.error('Нет данных');
            }
        } catch (error) {
            console.error('Ошибка:', error);
        }
    };

    handlePageChange(page) {
        this.setState( {currentPage: page} );
    }

    toggleColor = (event) => {
        this.setState({ isChecked: event.target.checked }); 
    };

    handleApplication = async (user_id, project_id) => {

        const { formData } = this.state;
        formData.project_id = project_id;
        formData.user_id = user_id;

        this.setState({ formData });
        try {
            const response = await fetch(`${API_URL}/add-applications`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.state.formData),
            });

            if (response.ok) {
                alert('Запрос на участие успешно отправлен!');
            } else {
                const data = await response.json();
                console.log(data.error);
            }
        } catch (error) {
            console.log(error);
        }
    }

    handleProjectSelect = (projectId) => {
        const { selectedProjects } = this.state;
        
        if (selectedProjects.includes(projectId)) {
            this.setState({
                selectedProjects: selectedProjects.filter(id => id !== projectId)
            });
        } else {
            this.setState({
                selectedProjects: [...selectedProjects, projectId]
            });
        }

    };

    handleTeamFormation = (selectedProjects) => {
        // Логика для формирования команды на основе выбранных проектов
        console.log("Выбранные проекты для формирования команды:", selectedProjects);
    };

    handleCountChange = (event) => {
        this.setState({ selectedCount: event.target.value});
    };

    handleStatusChange = (event) => {
        this.setState({ selectedStatus: event.target.value});
    };

    handleTeachersChange = (event) => {
        this.setState({ selectedTeacher: event.target.value});
    };

    handleChange = async (e) => {
        e.preventDefault();
        const formFilterData = ({
            teacher: this.state.selectedTeacher,
            count: this.state.selectedCount,
            status: this.state.selectedStatus,
        });
 
        try {
            const response = await fetch(`${API_URL}/get_info_from_db`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(formFilterData),
            });
    
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                this.setState({ projects_for_filtetrs: data})
            } else {
                const data = await response.json();
                alert(data.error);
            }
        } catch (error) {
            alert("Ошибка в отправке запроса");
            console.error(error);
        }
    }

    handleUndoChange = async (e) => {
        e.preventDefault();
        this.setState({ projects_for_filtetrs: null})

    }

    handleImageClick = () => {
        this.setState({isBlockVisible: !this.state.isBlockVisible});
    };

    render() {
        const searchValue = this.props.searchValue;
        const setSearchValue = this.props.setSearchValue;

        const { is_user } = this.state;
        
        return (
            <AuthContext.Consumer>
            {({ user }) => (
                    <div className='container'>
                        <div className='pt-30 flex'>
                            <h1 className=" m-0" style={{color: '#00AEEF'}}>Проекты</h1>
                            <img src='https://img.icons8.com/?size=100&id=ohhICQ3qIvZp&format=png&color=000000' 
                            style={{cursor:"pointer", marginLeft:'10px', marginTop:'10px',width:'25px', height:'25px'}}
                            onClick={this.handleImageClick}/>
                        </div>

                        {this.state.isBlockVisible && (
                            <div className='mt-3' style={{ border: '1px solid #cccccc', display: 'flex', flexDirection: 'column', padding: '20px', borderRadius: '10px' }}>
                                <h5 className=" m-0" style={{color: '#00AEEF'}}>Поиск по фильтрам</h5>
                                <div className='d-flex mt-3 justify-content-between'>
                                    <div>
                                        <label className="form-label mt-3" style={{fontWeight: '600'}}>Куратор:</label>
                                        <br/>
                                        <select style={{ padding: '10px', border: '1px solid #cccccc'}} value={this.state.selectedTeacher} onChange={this.handleTeachersChange}>
                                        <option value="null">--------</option>
                                        {this.state.is_teacher_project && this.state.is_teacher_project.length > 0 && (
                                            this.state.is_teacher_project.map((obj, index) => (
                                                <option key={index} value={obj.id}>{obj.name}</option>
                                            ))
                                        )}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label mt-3" style={{fontWeight: '600'}} >Статус проект:</label>
                                        <br/>
                                        <select style={{ padding: '10px', border: '1px solid #cccccc' }} value={this.state.selectedStatus} onChange={this.handleStatusChange}>
                                            <option value="False">В работе</option>
                                            <option value="True">Завершен</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label mt-3" style={{fontWeight: '600'}} >Кол-во участников:</label>
                                        <br/>
                                        <select style={{ padding: '10px', border: '1px solid #cccccc' }} value={this.state.selectedCount} onChange={this.handleCountChange}>
                                            <option value="null">--------</option>
                                            {this.state.is_count_project && this.state.is_count_project.length > 0 && (
                                                this.state.is_count_project.map((count, index) => (
                                                    <option key={index} value={count}>{count}</option>
                                                ))
                                            )}
                                        </select>
                                    </div>
                                </div>
                                <div className='d-flex justify-content-end mt-4'>
                                    <a
                                        href='#'
                                        onClick={this.handleChange}
                                        className="btn-next mt-3 " 
                                        >Применить&nbsp;
                                    </a>
                                    <a
                                        href='#'
                                        style={{marginLeft:'10px', backgroundColor:'#999999'}}
                                        onClick={this.handleUndoChange}
                                        className="btn-next mt-3 " 
                                        >Отменить&nbsp;выбор
                                    </a>
                                </div>
                            </div>
                        )}

                        <div className='flex jc-sb mt-3 pt-30'> 
                            <div style={{flexGrow: 1}}>
                                <div className='d-flex justify-content-between'>
                                    <p style={{fontWeight: '600'}}>Поиск по названию и тегам:</p>
                                    {!this.state.isChecked ? (
                                        <p>Найдено {this.state.projects.filter(project => {
                                            if (project.title.toLowerCase().includes(searchValue.toLowerCase())) {
                                                return true;
                                            }
                                            for (let i = 0; i < project.tags.length; i++) {
                                                if(project.tags[i].tag.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())){
                                                    return true;
                                                }
                                            }
                                            return false;
                                        }).length} проектов(a)</p>
                                    ) : (
                                        <p>Найдено {this.state.projectsData.filter(project => {
                                            if (project.title.toLowerCase().includes(searchValue.toLowerCase())) {
                                                return true;
                                            }
                                            return false;
                                        }).length} проектов(а)</p>
                                    )}
                                </div>
                                <SearchBar searchValue={searchValue} setSearchValue={setSearchValue} /> 

                            </div>
                        </div>
                        
                        <div className='d-flex mt-3 justify-content-between'>
                            <div className='d-flex'>
                                <p style={{fontWeight: '600'}}>Команда сформирована:</p>
                                <label className="switch" style={{color: 'rgb(78, 77, 77)'}} >
                                    <input 
                                    type="checkbox" 
                                    name="PROP_DESK" 
                                    value="N" 
                                    onChange={this.toggleColor}
                                    checked={this.state.isChecked}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                            {user && is_user && !is_user.is_student ? (
                                <div className='justify-content-between'>
                                    <a data-fancybox="" data-src="#auth" href="/create" className="update-proj" >Добавить проект</a>
                                    <a href="/edit"><img width="32" height="32" src="https://img.icons8.com/small/32/4e4d4d/create-new.png" alt="create-new" className='button' style={{marginLeft:'10px'}}/></a>
                                </div>
                            ) : null }
                        </div>
                        {this.state.isChecked ? (
                        <div className="row row-cols-1 row-cols-md-3 g-4">
                            {this.state.projectsData.filter(project => {
                                if (project.title.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())) {
                                    return true;
                                }
                                return false;
                            }).map((project, index) =>
                                <div className="col mt-5">
                                    <div className="card" style={{borderRadius: "20px", overflow: "hidden"}} key={index}>
                                        <Link to={`/project/${project.id}`}>
                                            <div className="img" style={{height: "230px", backgroundImage: 'url(https://otkrytky.ru/o/img/0336/otrkytky-ru-109-cGluaW1nLmNvbQ.png)', backgroundPosition: "center", backgroundSize: "cover"}} alt=""></div>
                                        </Link>
                                        <div className="card-body fixed-size-card d-flex flex-column justify-content-between">
                                            <div className="tag-container">
                                                {project.tags.map((tag, index) => (
                                                    <p key={index} className="fs-16 lh-24 color-blue m-0" style={{padding: '2px'}}>{tag}</p>
                                                ))}
                                            </div>
                                            <h4 className='card-title'>{project.title.length > 100 ? project.title.slice(0, 100) + '...' : project.title}</h4>
                                            <div className=' border-top-grey'></div>
                                            <div className='flex card-text'>
                                                <img width="80" height="80" src="https://rsv.ru/account/img/placeHolder-m.4c1254a5.png" alt="user-male-circle--v1"/>
                                                <div>
                                                    <p className="m-0" style={{color: '#4E4D4D', fontSize:'14px', lineHeight:'20px'}}>Куратор</p>
                                                    {project.teachers.map((obj, index) => (
                                                        <h5 key={index} style={{color: '#4E4D4D', fontWeight: '700', lineHeight:'30px', marginBottom: '0'}}>{obj.name} </h5>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        ) : (
                            <div className="row row-cols-1 row-cols-md-3 g-4">
                                {this.state.projects_for_filtetrs && this.state.projects_for_filtetrs.length > 0 ? (
                                    this.state.projects_for_filtetrs.map((project, index) => (
                                        <div className="col mt-5" key={index}>
                                            <div className="card" style={{borderRadius: "20px", overflow: "hidden"}} key={index}>
                                                <Link to={`/project/${project.id}`}>
                                                    <div className="img" style={{height: "230px", backgroundImage: 'url(https://otkrytky.ru/o/img/0336/otrkytky-ru-109-cGluaW1nLmNvbQ.png)', backgroundPosition: "center", backgroundSize: "cover"}} alt=""></div>
                                                </Link>
                                                <div className="card-body fixed-size-card d-flex flex-column justify-content-between">
                                                    <div className="tag-container">
                                                        {project.tags && project.tags.map((tag,index) => (
                                                            <p key={index} className="fs-16 lh-24 color-blue m-0" style={{padding: '2px'}}>{tag.tag}</p>
                                                        ))}
                                                    </div>
                                                    <h4 className='card-title' style={{color: '#4E4D4D', fontWeight: '700', fontSize: '24px', lineHeight:'32px', marginTop: '8'}}>{project.title.length > 100 ? project.title.slice(0, 100) + '...' : project.title}</h4>
                                                    <div className='border-top-home'></div>
                                                    <div className='flex card-text'>
                                                        <img width="80" height="80" src="https://rsv.ru/account/img/placeHolder-m.4c1254a5.png" alt="user-male-circle--v1"/>
                                                        <div>
                                                            <p className="m-0" style={{color: '#4E4D4D', fontSize:'14px', lineHeight:'20px'}}>Куратор</p>
                                                            {project.teachers && project.teachers.map((obj, index) => (
                                                                <h5 key={index} style={{color: '#4E4D4D', fontWeight: '700', lineHeight:'30px', marginBottom: '0'}}>{obj.name} </h5>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {user && is_user && is_user.is_student && !this.state.applicationSubmitted ? (
                                                        <button className="btn mt-4 " onClick={() => this.handleApplication(user.user_id, project.id)}>Подать заявку на вступление</button>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    this.state.projects.filter(project => {
                                        if (project.title.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())) {
                                            return true;
                                        }
                                        for(let i=0; i < project.tags.length; i++) {
                                            if(project.tags[i].tag.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())){
                                                return true;
                                            }
                                        }
                                        return false;
                                    }).map((project, index) =>
                                        <div className="col mt-5">
                                            <div className="card" style={{borderRadius: "20px", overflow: "hidden"}} key={index}>
                                                <Link to={`/project/${project.id}`}>
                                                    <div className="img" style={{height: "230px", backgroundImage: 'url(https://otkrytky.ru/o/img/0336/otrkytky-ru-109-cGluaW1nLmNvbQ.png)', backgroundPosition: "center", backgroundSize: "cover"}} alt=""></div>
                                                </Link>
                                                <div className="card-body fixed-size-card d-flex flex-column justify-content-between">
                                                    {/* {user && is_user && !is_user.is_student ? (
                                                    <input style={{width:'15px', height:'15px', border: '2px solid #888'}} type="checkbox" onChange={() => this.handleProjectSelect(project.id)} checked={this.state.selectedProjects.includes(project.id)} />
                                                    ) : null} */}
                                                    <div className="tag-container">
                                                        {project.tags.map((tag,index) => (
                                                            <p key={index} className="fs-16 lh-24 color-blue m-0" style={{padding: '2px'}}>{tag.tag}</p>
                                                        ))}
                                                    </div>
                                                    <h4 className='card-title' style={{color: '#4E4D4D', fontWeight: '700', fontSize: '24px', lineHeight:'32px', marginTop: '8'}}>{project.title.length > 100 ? project.title.slice(0, 100) + '...' : project.title}</h4>
                                                    <div className='border-top-home'></div>
                                                    <div className='flex card-text'>
                                                        <img width="80" height="80" src="https://rsv.ru/account/img/placeHolder-m.4c1254a5.png" alt="user-male-circle--v1"/>
                                                        <div>
                                                            <p className="m-0" style={{color: '#4E4D4D', fontSize:'14px', lineHeight:'20px'}}>Куратор</p>
                                                            {project.teachers.map((obj, index) => (
                                                                <h5 key={index} style={{color: '#4E4D4D', fontWeight: '700', lineHeight:'30px', marginBottom: '0'}}>{obj.name} </h5>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {user && is_user && is_user.is_student && !this.state.applicationSubmitted ? (
                                                        <button className="btn mt-40" onClick={() => this.handleApplication(user.user_id, project.id)}>Подать заявку на вступление</button>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        )}
                    </div>
                )}
            </AuthContext.Consumer>
    );
  }
}

export default HomePage