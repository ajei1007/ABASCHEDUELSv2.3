import { Box } from "@mui/material";

const LazyYouTubeEmbed = ({ videoUrl }: { videoUrl: string }) => {
  return (
    <Box sx={{ position: "relative", width: "100%", height: 315 }}>
      <iframe
        width="100%"
        height="315"
        src={`${videoUrl}&rel=0&autoplay=0`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </Box>
  );
};

export default LazyYouTubeEmbed;
