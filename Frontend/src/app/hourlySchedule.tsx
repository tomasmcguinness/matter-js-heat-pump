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
    {transitions.map((entry, index) => {
        const nextHour = transitions[index + 1]?.hour ?? 24;
        const gap = nextHour - entry.hour;
        const widthPercent = (gap / 24) * 100;
        const visibility = entry.show ? 'visible' : 'hidden'; 

        return (
          <div
            key={index}
            style={{
                visibility: `${visibility}`,
              width: `${widthPercent}%`,
              backgroundColor: '#4A90E2',
              color: 'white',
              padding: '8px',
              textAlign: 'center',
              borderRight: '1px solid white',
              borderRadius: '5px'
            }}
          >
           {entry.temperature}°C
          </div>
        );
      })}

        </div>
    </div>;
}