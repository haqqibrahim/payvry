interface Props {
  regLevel: number;
}

const RegLevelIndicator: React.FC<Props> = ({ regLevel }) => {
  return (
    <div className='flex items-center justify-center gap-x-[25%] mb-5'>
      <div className={`w-10 h-1 rounded-3xl ${regLevel >= 1 ? 'bg-mine-shaft' : 'bg-grey-200'}`} />
      <div className={`w-10 h-1 rounded-3xl ${regLevel >= 2 ? 'bg-mine-shaft' : 'bg-grey-200'}`} />
      <div className={`w-10 h-1 rounded-3xl ${regLevel >= 3 ? 'bg-mine-shaft' : 'bg-grey-200'}`} />
      <div className={`w-10 h-1 rounded-3xl ${regLevel >= 4 ? 'bg-mine-shaft' : 'bg-grey-200'}`} />

    </div>
  );
};

export default RegLevelIndicator;
