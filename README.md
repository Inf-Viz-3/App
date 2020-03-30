# InfoVis Project

## Meeting notes

You can find the meetings notes [here](docs/Meetings.md).

## Development

### Use a Virtualenv

- `python3 -m venv ./venv`
- Activate based on your OS (how to [check here](https://docs.python.org/3/library/venv.html))
- Run in your virtual env `pip3 install -r requirements.txt`

### Run on Linux & Mac ###

* The app can be started by running: bash start_app.sh
* The app can then be accessed by navigating to http://127.0.0.1:5000/

### Run on Windows ###

* Type the following in your terminal when using windows CMD: set FLASK_ENV=development **OR** when using windows powershell: $env:FLASK_ENV=development
* Followed by: python run.py
* The app can then be accessed by navigating to http://127.0.0.1:5000/
