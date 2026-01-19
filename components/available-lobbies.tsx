import { Button } from "./ui/button";

const Players = [
    {
        name: "Ralph Hernandez",
        pet: "Cow",
        value: 15,
    },
    {
        name: "Ralph Hernandez",
        pet: "Turtle",
        value: 15,
    },
    {
        name: "Ralph Hernandez",
        pet: "Dog",
        value: 15,
    },
    {
        name: "Ralph Hernandez",
        pet: "Cat",
        value: 15,
    },
    {
        name: "Ralph Hernandez",
        pet: "Cat",
        value: 15,
    },
    {
        name: "Ralph Hernandez",
        pet: "Cat",
        value: 15,
    },
    {
        name: "Ralph Hernandez",
        pet: "Cat",
        value: 15,
    }
];

export default function AvailableLobbies() {
    return (
        <div className="mt-10 space-y-10">
            {Players.map((player, key) => (
                <div
                    className="w-full border border-border h-30 rounded-lg flex justify-between p-4"
                    key={key}
                >
                    <div>
                        <p>{player.name}</p>
                        <p>{player.pet}</p>
                        <p>{player.value}</p>
                    </div>
                    <div>
                        <Button variant={"outline"}>Join Lobby</Button>
                    </div>
                </div>
            ))}
        </div>
    );
}
