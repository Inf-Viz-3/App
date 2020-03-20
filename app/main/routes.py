from flask import render_template, request
from flask_restplus import inputs
from flask import jsonify
import pandas as pd

from . import data
from . import main
from . import models


@main.route('/', methods=['GET'])
def index():
    return render_template("home.html")


@main.route('/api/portraits_heatmap', methods=['GET'])
def get_portraits_heatmap():
    df_heat = data.get_heatmap()
    return df_heat.to_json(orient='records')


@main.route('/api/images', methods=['GET'])
def api_images():
    index = request.args.get("index", type=int)
    filterObj = getFilterParams()

    all_portaits = data.get_portraits_by_year_by_params(filterObj)

    pag = int(index * 100)
    all_portaits = all_portaits.drop_duplicates(subset = 'imgid')
    print('Amount of unique results for query: ', len(all_portaits))
    return all_portaits[['imgid', 'image_url', 'artwork_name', 'artist_full_name', 'creation_year']].iloc[pag: pag + 99].to_json(
        orient='records')


def getFilterParams():
    begin_date = request.args.get("beginDate")
    end_date = request.args.get("endDate")
    dimension = request.args.get("dimension")
    dimension_value = str.lower(request.args.get("dimension-value"))
    age = request.args.get("age")
    gender = request.args.get("gender")
    index = request.args.get("index")
    if gender is None:
        gender = ""
    else:
        gender = str.lower(gender)
    color = request.args.get("color")
    female = False
    male = False

    if dimension != "none":
        if (dimension == "age"):
            gender = request.args.get("gender").split(',')
            female = "female" in gender
            male = "male" in gender
            age = dimension_value
            color = request.args.get("color")
        if (dimension == "gender"):
            female = "female" == dimension_value
            male = "male" == dimension_value
            age = request.args.get("age")
            color = request.args.get("color")
        if (dimension == "group"):
            gender = request.args.get("gender").split(',')
            female = "female" in gender
            male = "male" in gender
            color = dimension_value
            age = request.args.get("age")
    else:
        gender = request.args.get("gender").split(',')
        female = "female" in gender
        male = "male" in gender
    
    selected_time = request.args.get("selected_time")

    if age is not None:
        age = age.split(',')  # To list

    if color is not None:
        color = color.split(',')

    if index is not None:
        index = int(index)

    filterObj = models.FilterObj(begin_date, end_date, age, female, male, color, selected_time, index, dimension, dimension_value)
    return filterObj


@main.route('/api/portrait_count_by_params', methods=['GET'])
def get_portrait_count_by_params():
    filterObj = getFilterParams()
    res = data.get_portrait_count_by_params(filterObj)
    if isinstance(res, pd.DataFrame):
        return res.to_json(orient='records')
    
    return {'period':'ALL', 'count': res}

@main.route('/api/faces_by_params', methods=['GET'])
def get_faces_by_params():
    filterObj = getFilterParams()

    faces = data.get_faces_by_params(filterObj)
    if isinstance(faces, pd.DataFrame):
        return faces.to_json(orient='records')
    return None


@main.route('/api/morphed_image_by_year', methods=['GET'])
def morphed_image_by_year():
    return 0


@main.route('/api/bubble', methods=['GET'])
def bubble_chart():
    filterObj = getFilterParams()
    return data.get_bubble(filterObj).to_json(orient='records')


@main.route('/api/color_dist', methods=['GET'])
def get_color_dist():
    filterObj = getFilterParams()
    return data.get_color_dist(filterObj).to_json(orient='records')


@main.route('/api/colors', methods=['GET'])
def get_colors():
    return data.get_colors().to_json(orient='records')


@main.route('/api/colors_200', methods=['GET'])
def get_colors_200():
    return data.get_colors_200().to_json(orient='records')
