const Cross = ({ type }) => (
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={type ?`cross cross--${type}` : 'cross'}>
            <mask id="mask0_4_117" style={{'maskType':'alpha'}} maskUnits="userSpaceOnUse" x="5" y="5" width="30" height="30">
                <path d="M13 7L7 13L14 20L7 27L13 33L20 26L27 33L33 27L26 20L33 13L27 7L20 14L13 7Z" strokeWidth="4" strokeLinejoin="round"/>
            </mask>
            <g mask="url(#mask0_4_117)">
                <path d="M2 2H38V38H2V2Z"/>
            </g>
        </svg>
    );

export default Cross;