import React from 'react';

interface Season {
    seasonNumber: number;
    episodes: Episode[];
}

interface Episode {
    episodeNumber: number;
    title: string;
}

interface SeasonsListProps {
    seasons: Season[];
}

const SeasonsList: React.FC<SeasonsListProps> = ({ seasons }) => {
    return (
        <div>
            {seasons.map((season) => (
                <div key={season.seasonNumber}>
                    <h2>Season {season.seasonNumber}</h2>
                    <ul>
                        {season.episodes.map((episode) => (
                            <li key={episode.episodeNumber}>{episode.title}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default SeasonsList;