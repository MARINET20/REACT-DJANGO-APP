import React, { Component } from 'react'
import { API_URL } from '../..';
import {
    useNavigate ,
} from "react-router-dom";
import { Chart, registerables } from 'chart.js';
import RadarChart from './RadarChart';

Chart.register(...registerables);

export class SearchTeamLastPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            students: null,
            skills: null,
            teamsArray: [],
            skillIds: [],
            activeSlideIndex: 0, // Индекс активного слайда
            formData: {
                project_id: null,
                studentIds: null
            },
        };
    }

    componentDidMount() {
        Promise.all([
            fetch(`${API_URL}/students`),
            fetch(`${API_URL}/skill`)
        ])
        .then(([res1, res2]) => Promise.all([res1.json(), res2.json()]))
        .then(([data1, data2]) => {
            this.setState({
                students: data1,
                skills: data2,
                teamsArray: this.props.teams.data, 
                skillIds: this.props.teams.data[0].skillIds
            });
        });
    }

    handleSlideChange = (index) => {
        this.setState({ activeSlideIndex: index });
    }

    handleSelectTeam = async () => {
        const selectedTeam = this.state.teamsArray[this.state.activeSlideIndex];
        // Здесь можно вызвать метод и передать информацию о выбранной команде
        const { formData } = this.state;
        formData.studentIds = selectedTeam.studentIds; 
        formData.project_id =  this.props.project_id;
        this.setState({ formData });

        // const history = useNavigate();

        try {
            const response = await fetch(`${API_URL}/add-team-db`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.state.formData),
            });

            if (response.ok) {
                const data = await response.json();
                alert('Команда успешно добавлена!');
                // history('/projects') 
            } else {
                const data = await response.json();
                alert('Ошибка при добавления команды');
            }

        } catch (error) {
            this.setState({ error: 'Ошибка при отправке данных', message: null });
            alert('Ошибка при отправке данных');
        }
    }

  render() {
    const { activeSlideIndex } = this.state;
    return (
      <div>
        { this.state.teamsArray.length === 0 ? (
            <div>
                <div className='pt-30 d-flex'>
                    <h1 className=" m-0">Идет поиск команды...</h1>  
                </div>
            </div>
        ):(
        <div>
            <div className='pt-30'> 
                <h1 className=" m-0" style={{color: '#00AEEF'}}> Ваша команда для проекта</h1>
                <br/>
                <h5 className=" m-0" style={{color: '#00325c'}}> {this.props.title}</h5>
                {/* <h4 style={{ color: "#00325c"}}>Ваша команда</h4> */}
            </div>
            <button
                className="btn-next mt-3"
                onClick={this.handleSelectTeam}
            >Выбрать&nbsp;команду</button>
            <div id="carouselExampleControls" className="carousel carousel-dark slide mt-3" data-bs-ride="carousel">
                <div className="carousel-inner">
                    {this.state.teamsArray.map((teamInfo, index) => (
                        <div key={index} className={`carousel-item ${index === activeSlideIndex ? 'active' : ''}`}>
                            <div className='section news-detail mt-0'>
                            <div className='left' style={{backgroundColor:'#fff'}}>
                                <RadarChart labels={teamInfo.skillIds.map(skillId => this.state.skills.find(s => s.id === skillId).skill)} data={teamInfo.skillIds.map(skillId => teamInfo.score[skillId] >= 2 && teamInfo.score[skillId] <= 5 ? Math.round((teamInfo.score[skillId] - 1) * 25) : 0)}  />
                            </div>
                            <div className='right' >
                                <div className="flex fl-row">
                                    <div className='flex fl-column align-items-start'>
                                        {teamInfo.studentIds.map((studentId, studentIndex) => {
                                            const student = this.state.students.find(student => student.id === studentId);
                                            return (
                                                <div key={index} className='d-flex justify-content-between'>
                                                    <img width="100%" 
                                                    height="auto" 
                                                    src={
                                                        student.photo
                                                        ? student.photo
                                                        : student.name.endsWith('а')
                                                            ? 'https://i.pinimg.com/736x/87/ff/14/87ff14780b70043d7a2e2d21fcdb26c1.jpg'
                                                            : 'https://rsv.ru/account/img/placeHolder-m.4c1254a5.png'
                                                    }
                                                    alt='' 
                                                    className='prew-user-photo'/>
                                                    <div style={{position: 'relative', zIndex: '1', padding: '30px', textAlign: 'right'}}>
                                                        <h6>{student.name}</h6>
                                                        <p>{student.direction}</p>
                                                        <h6>{student.course} курс</h6>
                                                    </div>
                                                    
                                                </div>
                                            )   
                                        })}
                                    </div>
                                </div>
                            </div>
                            </div>
                        </div>
                    ))}
                </div>
                <button onClick={() => this.handleSlideChange(activeSlideIndex - 1)}  className="carousel-control-prev" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                </button>
                <button onClick={() => this.handleSlideChange(activeSlideIndex + 1)}  className="carousel-control-next" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                </button>
            </div>
            {/* <button
                className="btn-next "
                onClick={this.handleSelectTeam}
            >Выбрать&nbsp;команду</button> */}
        </div>)}
      </div>
    )
  }
}

export default SearchTeamLastPage