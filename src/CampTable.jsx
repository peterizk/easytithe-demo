import { camps } from "./camps";
import "./CampTable.css";      // keep table styles isolated

export default function CampTable() {
  return (
    <table className="camp-table">
      <thead>
        <tr>
          <th>Camp</th>
          <th>Dates</th>
          <th>Age&nbsp;Group</th>
          <th>Location</th>
          <th>Register</th>
        </tr>
      </thead>
      <tbody>
        {camps.map((c) => (
          <tr key={c.name}>
            <td>{c.name}</td>
            <td>{c.dates}</td>
            <td>{c.age}</td>
            <td>{c.location}</td>
            <td>
              <a
                href={c.link}
                className="register-link"
              >
                Register
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
