from openai import OpenAI
import json
import time
import os
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.forms import ModelForm
from django import forms
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.middleware import csrf
from django import forms
from decouple import config

from .models import User


client = OpenAI(api_key = config('OPEN_API_KEY'))

@csrf_exempt
def getClarenceResponse(request, questionContent):
    if not request.session["thread_info"]:
        assistant = client.beta.assistants.create(
            name = "Clarence",
            instructions = """You are santa's elf named Clarence, you help users get christmas gift ideas by listing them some suggestions. 
            Only make this list of suggestions once you get their Name, Age, and Interests so you can narrow down a better list for them.
            If they only give a name, then ask them for the other details. If they give you their title (for example: mom, dad, brother, 
            sister, cousin, etc) that will suffice as a name as well. Each response you make should be less than 100 words, and once you 
            make your list, it should only contain 3 narrowed down choices and they should be listed as bullet points. The user could ask for more
            suggestions if they ask, but just keep it limited to 3 gift ideas per message. Make sure to make funny remarks about anything christmas 
            when applicable, including santa, the north pole, and references to christmas movies.""",
            model = "gpt-4-1106-preview",
        )
    
        thread = client.beta.threads.create()

        message = client.beta.threads.messages.create(
            thread_id = thread.id,
            role = "user",
            content = questionContent,
        )  
    
        run = client.beta.threads.runs.create(
            thread_id = thread.id,
            assistant_id = assistant.id
        )

        status = run.status

        while(status != "completed"):
            run_assistant = client.beta.threads.runs.retrieve(
            thread_id = thread.id,
            run_id = run.id
            )
            status = run_assistant.status
            print(status)
            time.sleep(2)
            
        request.session["thread_info"].append({"thread_id": thread.id, "assistant_id": assistant.id})
        request.session.modified = True

        messages = client.beta.threads.messages.list(
            thread_id = thread.id
        )
        
        return messages
    else:
        thread_id = request.session["thread_info"][0].get("thread_id")
        assistant_id = request.session["thread_info"][0].get("assistant_id")
        
        message = client.beta.threads.messages.create(
            thread_id = thread_id,
            role = "user",
            content = questionContent,
        )
        
        run = client.beta.threads.runs.create(
            thread_id = thread_id,
            assistant_id = assistant_id,
        )
        
        status = run.status

        while(status != "completed"):
            run_assistant = client.beta.threads.runs.retrieve(
            thread_id = thread_id,
            run_id = run.id
            )
            status = run_assistant.status
            print(status)
            time.sleep(2)
            
        messages = client.beta.threads.messages.list(
            thread_id = thread_id
        )
        
        return messages
    
    
@csrf_exempt
def clarenceConvo(request):
    messages = []
    messageList = []
    if "thread_info" not in request.session:
        request.session["thread_info"] = []
        
    if request.method == "POST":
        data = json.loads(request.body)
        questionContent = data.get("questionContent")
        if questionContent == "":
            return JsonResponse({"error": "Post cannot be blank."}, status=400)
        
        messages = getClarenceResponse(request, questionContent)
        
        for message in messages.data:
            messageList.append(message.content[0].text.value)
    
    return JsonResponse(messageList[0], safe=False)


def index(request):
    request.session.flush()
    return render(request, "clarence/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "clarence/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "clarence/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "clarence/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "clarence/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "clarence/register.html")
