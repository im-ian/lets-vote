import { useParams } from "@tanstack/react-router";
import Container from "./components/containter";

function RoomPage() {
  const { roomId } = useParams({ from: "/room/$roomId" });

  return (
    <Container>
      <div className="text-2xl font-bold">Room: {roomId}</div>
    </Container>
  );
}

export default RoomPage;
