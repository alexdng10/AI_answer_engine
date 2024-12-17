
import { Card } from '@/components/ui/card';

const WomanDatabaseTables = () => {
  const womanData = [
    { womanId: 5, firstName: "Chelsea", lastName: "Clinton", motherId: 45, cityId: "TA" },
    { womanId: 45, firstName: "Hilary", lastName: "Clinton", motherId: 23, cityId: "DE" },
    { womanId: 23, firstName: "Betty", lastName: "Rodham", motherId: 0, cityId: "TA" },
    { womanId: 22, firstName: "Kathy Lee", lastName: "Gifford", motherId: 0, cityId: "DE" },
    { womanId: 0, firstName: "Unknown", lastName: "Unknown", motherId: 0, cityId: "DE" },
    { womanId: 26, firstName: "Cassidy", lastName: "Gifford", motherId: 22, cityId: "LA" }
  ];

  const birthLocations = [
    { cityId: "TA", city: "Tampa", state: "FL", country: "USA" },
    { cityId: "TO", city: "Toronto", state: "ON", country: "Canada" },
    { cityId: "LA", city: "Los Angeles", state: "CA", country: "USA" },
    { cityId: "DE", city: "Denver", state: "CO", country: "USA" }
  ];

  return (
    <div className="space-y-6 mb-6">
      {/* Woman Table */}
      <div>
        <h3 className="text-lg font-medium mb-2 text-gray-200">Woman:</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["WomanID", "FirstName", "LastName", "MotherOfWomanID", "CityOfBirthID"].map((header) => (
                  <th key={header} className="px-4 py-2 bg-gray-800 text-left text-gray-200 border border-gray-700">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {womanData.map((row) => (
                <tr key={row.womanId}>
                  <td className="px-4 py-2 border border-gray-700">{row.womanId}</td>
                  <td className="px-4 py-2 border border-gray-700">{row.firstName}</td>
                  <td className="px-4 py-2 border border-gray-700">{row.lastName}</td>
                  <td className="px-4 py-2 border border-gray-700">{row.motherId}</td>
                  <td className="px-4 py-2 border border-gray-700">{row.cityId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BirthLocation Table */}
      <div>
        <h3 className="text-lg font-medium mb-2 text-gray-200">BirthLocation:</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["CityOfBirthID", "City", "State", "Country"].map((header) => (
                  <th key={header} className="px-4 py-2 bg-gray-800 text-left text-gray-200 border border-gray-700">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {birthLocations.map((row) => (
                <tr key={row.cityId}>
                  <td className="px-4 py-2 border border-gray-700">{row.cityId}</td>
                  <td className="px-4 py-2 border border-gray-700">{row.city}</td>
                  <td className="px-4 py-2 border border-gray-700">{row.state}</td>
                  <td className="px-4 py-2 border border-gray-700">{row.country}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-gray-300 space-y-1">
        <p>SQL referential constraints:</p>
        <div className="bg-gray-800/50 p-2 rounded space-y-2 whitespace-pre-wrap break-words">
          <div>- alter table Woman add constraint C1 Foreign key (MotherOfWomanID) references Woman(WomanID)</div>
          <div>- alter table Woman add constraint C2 Foreign key (CityOfBirthID) references BirthLocation(CityOfBirthID)</div>
        </div>
      </div>
    </div>
  );
};

export default WomanDatabaseTables;
