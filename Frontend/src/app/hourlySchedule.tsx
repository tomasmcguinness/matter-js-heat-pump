'use client'

type HourlyScheduleProps = {
    transitions: any[];
};

export const HourlySchedule = ({ transitions }: HourlyScheduleProps) => {

    if (transitions == null || transitions.length == 0) {
        return <div className="alert alert-info" style={{ marginBottom: '0' }}>No Schedule Data Available</div>;
    }
     
    

    return <div className="hourlyScheduleContainer">
        <div className="slotsContainer">

        </div>
    </div>;
}